// Mode Manager - Hybrid OFF-chain/ON-chain Architecture
// Manages switching between Simple Mode (Firebase) and Blockchain Mode (Smart Contracts)

// ============================================
// MODE DETECTION AND CONFIGURATION
// ============================================

const MODE_TYPES = {
    SIMPLE: 'simple',      // Firebase-based expense tracking
    BLOCKCHAIN: 'blockchain' // Smart contract-based
};

/**
 * Mode Manager Class
 * Handles all operations for both Simple and Blockchain modes
 */
class ModeManager {
    constructor() {
        this.currentMode = null;
        this.currentGroupId = null;
        this.groupData = null;
        this.listeners = [];
    }
    
    /**
     * Detect mode of a group
     * @param {string} groupId Group ID or contract address
     * @returns {string} Mode type ('simple' or 'blockchain')
     */
    detectMode(groupId) {
        // If it starts with '0x' and is 42 chars, it's a blockchain address
        if (groupId && groupId.startsWith('0x') && groupId.length === 42) {
            return MODE_TYPES.BLOCKCHAIN;
        }
        // Otherwise it's a Firebase simple mode group
        return MODE_TYPES.SIMPLE;
    }
    
    /**
     * Initialize mode for a group
     * @param {string} groupId Group ID or contract address
     * @returns {Promise<boolean>} Success status
     */
    async initializeMode(groupId) {
        try {
            this.currentGroupId = groupId;
            this.currentMode = this.detectMode(groupId);
            
            
            if (this.currentMode === MODE_TYPES.SIMPLE) {
                // Load simple mode data from Firebase
                this.groupData = await this.loadSimpleGroup(groupId);
            } else {
                // Load blockchain mode data from contract
                this.groupData = await this.loadBlockchainGroup(groupId);
            }
            
            return true;
        } catch (error) {
            console.error("❌ Failed to initialize mode:", error);
            return false;
        }
    }
    
    // ============================================
    // SIMPLE MODE - GROUP MANAGEMENT
    // ============================================
    
    /**
     * Create a new Simple Mode group (Firebase)
     * @param {Object} groupInfo Group information
     * @returns {Promise<string>} Group ID
     */
    async createSimpleGroup(groupInfo) {
        try {
            if (!window.FirebaseConfig.isAuthenticated()) {
                throw new Error("User must be authenticated to create group");
            }
            
            // ✅ SUBSCRIPTION CHECK: Verify user can create groups
            const user = window.FirebaseConfig.getCurrentUser();
            const canCreate = await window.SubscriptionManager.canCreateGroup(user.uid);
            if (!canCreate.allowed) {
                window.SubscriptionManager.showUpgradeModal(window.SubscriptionManager.FEATURES.MULTIPLE_GROUPS);
                throw new Error(canCreate.reason);
            }
            
            // ✅ RATE LIMITING: Prevenir spam de creación de grupos
            await window.checkRateLimit('createGroup');
            
            // ✅ VALIDACIÓN Y SANITIZACIÓN: Proteger contra inputs maliciosos
            const validatedInfo = window.Validators.validateGroupInfo(groupInfo);
            
            const groupId = this.generateGroupId();
            
            const groupData = {
                id: groupId,
                name: validatedInfo.name,
                description: validatedInfo.description || '',
                icon: validatedInfo.icon || '📦',
                mode: MODE_TYPES.SIMPLE,
                createdBy: user.uid,
                createdByEmail: user.email,
                createdByName: user.displayName || user.email,
                createdAt: Date.now(),
                isActive: true,
                targetAmount: validatedInfo.targetAmount || 0,
                currency: validatedInfo.currency || 'USD',
                preferredCurrency: groupInfo.preferredCurrency || 'NONE', // Default currency for expenses
                
                // Members
                members: {
                    [user.uid]: {
                        email: user.email,
                        name: user.displayName || user.email,
                        joinedAt: Date.now(),
                        role: 'creator',
                        totalContributed: 0
                    }
                },
                
                // Expenses (will be added later)
                expenses: {},
                
                // Settlements (will be recorded later)
                settlements: {},
                
                // Settings
                settings: {
                    approvalThreshold: 0.6, // 60% approval needed
                    allowDirectSettlement: true,
                    notificationsEnabled: true
                }
            };
            
            // Write to Firebase
            await window.FirebaseConfig.writeDb(`groups/${groupId}`, groupData);
            
            // Add to user's groups list
            await window.FirebaseConfig.updateDb(`users/${user.uid}/groups/${groupId}`, {
                name: validatedInfo.name,
                role: 'creator',
                joinedAt: Date.now()
            });
            
            // ✅ CREATE WELCOME CHEST: Give first item to help users understand mascot system
            try {
                console.log('🔍 Checking MascotSystem availability...');
                console.log('   window.MascotSystem exists:', !!window.MascotSystem);
                console.log('   createWelcomeChest function exists:', typeof window.MascotSystem?.createWelcomeChest);
                
                if (window.MascotSystem && typeof window.MascotSystem.createWelcomeChest === 'function') {
                    console.log('📦 Creating welcome chest for group:', groupId);
                    await window.MascotSystem.createWelcomeChest(groupId);
                    console.log('🎁 Welcome chest created for new group');
                } else {
                    console.warn('⚠️ MascotSystem or createWelcomeChest not available');
                }
            } catch (chestError) {
                console.error('⚠️ Failed to create welcome chest (non-critical):', chestError);
                // Don't fail group creation if welcome chest fails
            }
            
            // ✅ REGISTRAR ACCIÓN: Para rate limiting
            await window.recordRateLimitAction('createGroup');
            
            return groupId;
            
        } catch (error) {
            console.error("❌ Failed to create simple group:", error);
            throw error;
        }
    }
    
    /**
     * Update group info (icon, name, description)
     * Only creator can update
     * @param {Object} updateInfo Updated information
     * @returns {Promise<boolean>}
     */
    async updateGroupInfo(updateInfo) {
        try {
            if (!this.currentGroupId) {
                throw new Error("No group selected");
            }
            
            const user = window.FirebaseConfig.getCurrentUser();
            const groupData = await window.FirebaseConfig.readDb(`groups/${this.currentGroupId}`);
            
            // Verify user is creator
            if (groupData.createdBy !== user.uid) {
                throw new Error("Only the group creator can edit group info");
            }
            
            // Validate inputs
            const validatedInfo = window.Validators.validateGroupInfo({
                name: updateInfo.name,
                description: updateInfo.description || '',
                icon: updateInfo.icon || '📦'
            });
            
            // Update only the specified fields
            const updates = {
                name: validatedInfo.name,
                description: validatedInfo.description,
                icon: validatedInfo.icon,
                updatedAt: Date.now(),
                updatedBy: user.uid
            };
            
            await window.FirebaseConfig.updateDb(
                `groups/${this.currentGroupId}`,
                updates
            );
            
            return true;
            
        } catch (error) {
            console.error("❌ Failed to update group info:", error);
            throw error;
        }
    }
    
    /**
     * Load Simple Mode group data
     * @param {string} groupId Group ID
     * @returns {Promise<Object>} Group data
     */
    async loadSimpleGroup(groupId) {
        try {
            const data = await window.FirebaseConfig.readDb(`groups/${groupId}`);
            if (!data) {
                throw new Error("Group not found");
            }
            return data;
        } catch (error) {
            console.error("❌ Failed to load simple group:", error);
            throw error;
        }
    }
    
    // ============================================
    // SIMPLE MODE - EXPENSE MANAGEMENT
    // ============================================
    
    /**
     * Add expense to Simple Mode group
     * @param {Object} expenseInfo Expense information
     * @returns {Promise<string>} Expense ID
     */
    async addSimpleExpense(expenseInfo) {
        try {
            if (!window.FirebaseConfig.isAuthenticated()) {
                throw new Error("User must be authenticated");
            }
            
            // ✅ RATE LIMITING: Prevenir spam de gastos
            await window.checkRateLimit('addExpense');
            
            // ✅ VALIDACIÓN Y SANITIZACIÓN: Proteger contra inputs maliciosos
            const validatedInfo = window.Validators.validateExpenseInfo(expenseInfo);
            
            const user = window.FirebaseConfig.getCurrentUser();
            const expenseId = this.generateExpenseId();
            const timestamp = Date.now();
            
            const expense = {
                id: expenseId,
                description: validatedInfo.description,
                amount: validatedInfo.amount,
                paidBy: expenseInfo.paidBy || user.uid,
                paidByName: expenseInfo.paidByName || user.displayName || user.email,
                splitBetween: expenseInfo.splitBetween, // Array of user IDs
                timestamp: timestamp,
                createdAt: timestamp,
                date: expenseInfo.date || new Date().toISOString().split('T')[0],
                currency: validatedInfo.currency || 'USD', // Add currency field
                
                // No approval system - expenses are immediately accepted
                status: 'approved',
                
                // Metadata
                category: validatedInfo.category || 'other',
                receipt: expenseInfo.receipt || null,
                notes: validatedInfo.notes || ''
            };
            
            // Write expense to Firebase
            await window.FirebaseConfig.writeDb(
                `groups/${this.currentGroupId}/expenses/${expenseId}`,
                expense
            );
            
            
            // 🔔 NOTIFICATION: Notify all group members about new expense
            try {
                const groupSnapshot = await window.FirebaseConfig.readDb(`groups/${this.currentGroupId}`);
                const groupData = groupSnapshot || {};
                
                // Notify all members except the one who added the expense
                const message = `${user.displayName || user.email} added ${expense.category}: ${expense.description} - ${expense.currency} ${expense.amount}`;
                
                if (typeof window.notifyGroupMembers === 'function') {
                    await window.notifyGroupMembers(this.currentGroupId, 'expense_added', message, { 
                        groupName: this.currentGroupData?.fundName,
                        expenseId: expenseId
                    });
                }
            } catch (notifError) {
                console.error('Error sending expense notification:', notifError);
                // Don't fail the expense creation if notification fails
            }
            
            // ✅ REGISTRAR ACCIÓN: Para rate limiting
            await window.recordRateLimitAction('addExpense');
            
            return expenseId;
            
        } catch (error) {
            console.error("❌ Failed to add expense:", error);
            throw error;
        }
    }
    
    // ============================================
    // RECURRING EXPENSES
    // ============================================
    
    /**
     * Create recurring expense
     * @param {Object} recurringInfo Recurring expense information
     * @returns {Promise<string>} Recurring expense ID
     */
    async createRecurringExpense(recurringInfo) {
        try {
            if (!window.FirebaseConfig.isAuthenticated()) {
                throw new Error("User must be authenticated");
            }
            
            const recurringId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const recurring = {
                id: recurringId,
                description: recurringInfo.description,
                amount: recurringInfo.amount,
                currency: recurringInfo.currency || 'USD',
                frequency: recurringInfo.frequency, // 'daily', 'weekly', 'monthly'
                dayOfMonth: recurringInfo.dayOfMonth || 1, // For monthly
                dayOfWeek: recurringInfo.dayOfWeek || 1, // For weekly (1=Monday, 7=Sunday)
                paidBy: recurringInfo.paidBy,
                paidByName: recurringInfo.paidByName,
                splitBetween: recurringInfo.splitBetween,
                category: recurringInfo.category || 'recurring',
                isActive: true,
                createdAt: Date.now(),
                lastCreated: null, // Timestamp of last auto-created expense
                nextDue: this.calculateNextDue(recurringInfo.frequency, recurringInfo.dayOfMonth, recurringInfo.dayOfWeek)
            };
            
            await window.FirebaseConfig.writeDb(
                `groups/${this.currentGroupId}/recurringExpenses/${recurringId}`,
                recurring
            );
            
            return recurringId;
            
        } catch (error) {
            console.error("❌ Failed to create recurring expense:", error);
            throw error;
        }
    }
    
    /**
     * Calculate next due date for recurring expense
     */
    calculateNextDue(frequency, dayOfMonth, dayOfWeek) {
        const now = new Date();
        const next = new Date();
        
        switch(frequency) {
            case 'daily':
                next.setDate(now.getDate() + 1);
                break;
            case 'weekly':
                const currentDay = now.getDay(); // 0=Sunday, 6=Saturday
                const targetDay = dayOfWeek === 7 ? 0 : dayOfWeek; // Convert to JS format
                const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7;
                next.setDate(now.getDate() + daysUntilNext);
                break;
            case 'monthly':
                next.setMonth(now.getMonth() + 1);
                next.setDate(dayOfMonth);
                if (next < now) {
                    next.setMonth(next.getMonth() + 1);
                }
                break;
        }
        
        return next.getTime();
    }
    
    /**
     * Update recurring expense
     */
    async updateRecurringExpense(recurringId, updates) {
        try {
            await window.FirebaseConfig.updateDb(
                `groups/${this.currentGroupId}/recurringExpenses/${recurringId}`,
                updates
            );
            return true;
        } catch (error) {
            console.error("❌ Failed to update recurring expense:", error);
            throw error;
        }
    }
    
    /**
     * Delete recurring expense
     */
    async deleteRecurringExpense(recurringId) {
        try {
            await window.FirebaseConfig.deleteDb(
                `groups/${this.currentGroupId}/recurringExpenses/${recurringId}`
            );
            return true;
        } catch (error) {
            console.error("❌ Failed to delete recurring expense:", error);
            throw error;
        }
    }
    
    /**
     * Load all recurring expenses for group
     */
    async loadRecurringExpenses() {
        try {
            const recurring = await window.FirebaseConfig.readDb(
                `groups/${this.currentGroupId}/recurringExpenses`
            );
            
            if (!recurring) return [];
            
            return Object.values(recurring).filter(r => r.isActive);
        } catch (error) {
            console.error("❌ Failed to load recurring expenses:", error);
            return [];
        }
    }
    
    /**
     * Process recurring expenses that are due
     * Creates actual expenses from recurring templates when nextDue has passed
     * @returns {Promise<number>} Number of expenses created
     */
    async processRecurringExpenses() {
        try {
            const recurring = await this.loadRecurringExpenses();
            const now = Date.now();
            let createdCount = 0;
            
            for (const rec of recurring) {
                // Check if it's time to create the expense
                if (rec.nextDue <= now && rec.isActive) {
                    
                    try {
                        // Create the actual expense
                        const expenseId = await this.addSimpleExpense({
                            description: `${rec.description} (Recurring)`,
                            amount: rec.amount,
                            currency: rec.currency,
                            category: rec.category,
                            paidBy: rec.paidBy,
                            paidByName: rec.paidByName,
                            splitBetween: rec.splitBetween,
                            notes: `Auto-generated from recurring expense on ${new Date().toLocaleDateString()}`
                        });
                        
                        // Calculate next due date
                        const nextDue = this.calculateNextDue(
                            rec.frequency,
                            rec.dayOfMonth,
                            rec.dayOfWeek
                        );
                        
                        // Update recurring expense record
                        await this.updateRecurringExpense(rec.id, {
                            lastCreated: now,
                            nextDue: nextDue
                        });
                        
                        createdCount++;
                        
                        // Notify group members about auto-created expense
                        try {
                            const groupData = await window.FirebaseConfig.readDb(`groups/${this.currentGroupId}`);
                            const message = `Recurring expense created: ${rec.description} - ${rec.currency} ${rec.amount}`;
                            
                            if (typeof notifyGroupMembers === 'function') {
                                await notifyGroupMembers(
                                    this.currentGroupId,
                                    'recurring_expense_created',
                                    message,
                                    {
                                        groupName: groupData?.name,
                                        expenseId: expenseId,
                                        recurringId: rec.id
                                    }
                                );
                            }
                        } catch (notifError) {
                            console.error('❌ Failed to send notification:', notifError);
                        }
                        
                    } catch (expenseError) {
                        console.error('❌ Failed to create expense from recurring:', expenseError);
                    }
                }
            }
            
            return createdCount;
            
        } catch (error) {
            console.error("❌ Failed to process recurring expenses:", error);
            return 0;
        }
    }
    
    // ============================================
    // GROUP BUDGET
    // ============================================
    
    /**
     * Set group budget
     */
    async setGroupBudget(budgetInfo) {
        try {
            const budget = {
                enabled: true,
                amount: budgetInfo.amount,
                currency: budgetInfo.currency || 'USD',
                period: budgetInfo.period || 'monthly', // 'trip', 'monthly', 'weekly'
                startDate: budgetInfo.startDate || Date.now(),
                endDate: budgetInfo.endDate || null,
                alertThresholds: budgetInfo.alertThresholds || [50, 80, 100], // % thresholds
                notifiedAt: {}, // Track which thresholds have been notified
                createdAt: Date.now()
            };
            
            await window.FirebaseConfig.writeDb(
                `groups/${this.currentGroupId}/budget`,
                budget
            );
            
            return true;
        } catch (error) {
            console.error("❌ Failed to set budget:", error);
            throw error;
        }
    }
    
    /**
     * Load group budget
     */
    async loadGroupBudget() {
        try {
            const budget = await window.FirebaseConfig.readDb(
                `groups/${this.currentGroupId}/budget`
            );
            return budget;
        } catch (error) {
            console.error("❌ Failed to load budget:", error);
            return null;
        }
    }
    
    /**
     * Calculate budget status
     */
    async calculateBudgetStatus() {
        try {
            const budget = await this.loadGroupBudget();
            if (!budget || !budget.enabled) {
                return null;
            }
            
            // Load all expenses
            const expenses = await window.FirebaseConfig.readDb(
                `groups/${this.currentGroupId}/expenses`
            );
            
            if (!expenses) {
                return {
                    budget: budget.amount,
                    spent: 0,
                    remaining: budget.amount,
                    percentage: 0,
                    currency: budget.currency,
                    status: 'good' // 'good', 'warning', 'exceeded'
                };
            }
            
            // Calculate total spent (filter by budget period if needed)
            let totalSpent = 0;
            Object.values(expenses).forEach(expense => {
                if (expense.status === 'approved') {
                    // Convert to budget currency if needed (simplified - same currency for now)
                    if (expense.currency === budget.currency) {
                        totalSpent += expense.amount;
                    }
                }
            });
            
            const remaining = budget.amount - totalSpent;
            const percentage = (totalSpent / budget.amount) * 100;
            
            let status = 'good';
            if (percentage >= 100) status = 'exceeded';
            else if (percentage >= 80) status = 'warning';
            
            return {
                budget: budget.amount,
                spent: totalSpent,
                remaining: remaining,
                percentage: percentage,
                currency: budget.currency,
                status: status,
                alertThresholds: budget.alertThresholds
            };
            
        } catch (error) {
            console.error("❌ Failed to calculate budget status:", error);
            return null;
        }
    }
    
    // ============================================
    // ANALYTICS
    // ============================================
    
    /**
     * Generate expense analytics
     */
    async generateAnalytics(timeframe = 'all') {
        try {
            const expenses = await window.FirebaseConfig.readDb(
                `groups/${this.currentGroupId}/expenses`
            );
            
            if (!expenses) {
                return {
                    totalSpent: 0,
                    expenseCount: 0,
                    byCategory: {},
                    byMember: {},
                    byMonth: {},
                    byCurrency: {},
                    averageExpense: 0
                };
            }
            
            const expenseList = Object.values(expenses).filter(e => e.status === 'approved');
            
            // Apply timeframe filter
            const now = Date.now();
            const filteredExpenses = expenseList.filter(expense => {
                if (timeframe === 'all') return true;
                
                const expenseTime = expense.timestamp;
                const dayMs = 24 * 60 * 60 * 1000;
                
                switch(timeframe) {
                    case 'week':
                        return (now - expenseTime) <= (7 * dayMs);
                    case 'month':
                        return (now - expenseTime) <= (30 * dayMs);
                    case 'year':
                        return (now - expenseTime) <= (365 * dayMs);
                    default:
                        return true;
                }
            });
            
            // Calculate analytics
            let totalSpent = 0;
            const byCategory = {};
            const byMember = {};
            const byMonth = {};
            const byCurrency = {};
            
            filteredExpenses.forEach(expense => {
                const amount = expense.amount;
                totalSpent += amount;
                
                // By category
                const category = expense.category || 'other';
                byCategory[category] = (byCategory[category] || 0) + amount;
                
                // By member (who paid)
                const paidBy = expense.paidByName || expense.paidBy;
                byMember[paidBy] = (byMember[paidBy] || 0) + amount;
                
                // By month
                const date = new Date(expense.timestamp);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                byMonth[monthKey] = (byMonth[monthKey] || 0) + amount;
                
                // By currency
                const currency = expense.currency || 'USD';
                byCurrency[currency] = (byCurrency[currency] || 0) + amount;
            });
            
            return {
                totalSpent,
                expenseCount: filteredExpenses.length,
                byCategory,
                byMember,
                byMonth,
                byCurrency,
                averageExpense: filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0,
                timeframe
            };
            
        } catch (error) {
            console.error("❌ Failed to generate analytics:", error);
            throw error;
        }
    }
    
    /**
     * Approve or reject an expense
     * @param {string} expenseId Expense ID
     * @param {boolean} approve Approval status
     * @returns {Promise<boolean>} Success status
     */
    async approveExpense(expenseId, approve) {
        try {
            if (!window.FirebaseConfig.isAuthenticated()) {
                throw new Error("User must be authenticated");
            }
            
            const user = window.FirebaseConfig.getCurrentUser();
            
            // Record approval
            await window.FirebaseConfig.updateDb(
                `groups/${this.currentGroupId}/expenses/${expenseId}/approvals/${user.uid}`,
                {
                    approved: approve,
                    timestamp: Date.now()
                }
            );
            
            // Check if expense meets approval threshold
            const expense = await window.FirebaseConfig.readDb(
                `groups/${this.currentGroupId}/expenses/${expenseId}`
            );
            
            const approvalStatus = this.calculateApprovalStatus(expense);
            
            // Update expense status if needed
            if (approvalStatus.isApproved && expense.status === 'pending') {
                await window.FirebaseConfig.updateDb(
                    `groups/${this.currentGroupId}/expenses/${expenseId}`,
                    { status: 'approved' }
                );
            } else if (approvalStatus.isRejected && expense.status === 'pending') {
                await window.FirebaseConfig.updateDb(
                    `groups/${this.currentGroupId}/expenses/${expenseId}`,
                    { status: 'rejected' }
                );
            }
            
            return true;
            
        } catch (error) {
            console.error("❌ Failed to approve expense:", error);
            throw error;
        }
    }
    
    /**
     * Calculate approval status for expense
     * @param {Object} expense Expense object
     * @returns {Object} Approval status
     */
    calculateApprovalStatus(expense) {
        const involvedMembers = expense.splitBetween;
        const approvals = expense.approvals || {};
        
        let approveCount = 0;
        let rejectCount = 0;
        
        for (const memberId of involvedMembers) {
            if (approvals[memberId]) {
                if (approvals[memberId].approved) {
                    approveCount++;
                } else {
                    rejectCount++;
                }
            }
        }
        
        const totalInvolved = involvedMembers.length;
        const threshold = this.groupData.settings.approvalThreshold || 0.6;
        const requiredApprovals = Math.ceil(totalInvolved * threshold);
        
        return {
            approveCount,
            rejectCount,
            totalInvolved,
            requiredApprovals,
            isApproved: approveCount >= requiredApprovals,
            isRejected: rejectCount > (totalInvolved - requiredApprovals)
        };
    }
    
    // ============================================
    // SIMPLE MODE - BALANCE CALCULATIONS
    // ============================================
    
    /**
     * Calculate balances for Simple Mode (expense tracking algorithm)
     * @returns {Promise<Array>} Array of balance objects
     */
    async calculateSimpleBalances() {
        try {
            
            // Load all approved expenses
            const expensesData = await window.FirebaseConfig.readDb(
                `groups/${this.currentGroupId}/expenses`
            );
            
            
            if (!expensesData) {
                return [];
            }
            
            // Log all expense statuses
            Object.entries(expensesData).forEach(([id, exp]) => {
            });
            
            // In Simple Mode, ALL expenses count (no approval needed)
            const expenses = Object.values(expensesData);
            
            // Detect if group uses single currency
            const currencies = new Set(expenses.map(e => e.currency || 'USD'));
            const useSingleCurrency = currencies.size === 1;
            const groupCurrency = useSingleCurrency ? Array.from(currencies)[0] : 'USD';
            
            // Calculate net balances
            const balances = {};
            
            // Initialize all members
            const members = Object.keys(this.groupData.members);
            members.forEach(memberId => {
                balances[memberId] = 0;
            });
            
            // Process each expense
            for (const expense of expenses) {
                const paidBy = expense.paidBy;
                let amount = Number(expense.amount);
                
                // Only convert to USD if group has multiple currencies
                const currency = expense.currency || 'USD';
                if (!useSingleCurrency && currency !== 'USD' && window.convertToUSD) {
                    amount = await window.convertToUSD(amount, currency);
                }
                
                const splitBetween = expense.splitBetween;
                const perPerson = Math.round((amount / splitBetween.length) * 100) / 100;
                
                // Handle multiple payers
                const paidByArray = Array.isArray(paidBy) ? paidBy : [paidBy];
                const amountPerPayer = Math.round((amount / paidByArray.length) * 100) / 100;
                
                // Each person who paid gets their share as positive balance
                paidByArray.forEach(payerId => {
                    balances[payerId] = Math.round((balances[payerId] + amountPerPayer) * 100) / 100;
                });
                
                // People who owe get negative balance
                splitBetween.forEach(memberId => {
                    balances[memberId] = Math.round((balances[memberId] - perPerson) * 100) / 100;
                });
            }
            
            // Convert to array format
            const balanceArray = [];
            
            // Now subtract settlements (payments already made)
            const settlementsData = await window.FirebaseConfig.readDb(
                `groups/${this.currentGroupId}/settlements`
            );
            
            if (settlementsData) {
                for (const settlement of Object.values(settlementsData)) {
                    const amount = Number(settlement.amount);
                    
                    // Person who paid increases their balance (they're owed more or owe less)
                    balances[settlement.from] = Math.round((balances[settlement.from] + amount) * 100) / 100;
                    
                    // Person who received decreases their balance (they owe more or are owed less)
                    balances[settlement.to] = Math.round((balances[settlement.to] - amount) * 100) / 100;
                }
            }
            
            for (const [memberId, balance] of Object.entries(balances)) {
                if (Math.abs(balance) > 0.01) { // Ignore negligible amounts
                    const member = this.groupData.members[memberId];
                    balanceArray.push({
                        memberId,
                        memberName: member?.name || member?.email || 'Unknown',
                        balance: balance,
                        owes: balance < 0 ? Math.abs(balance) : 0,
                        isOwed: balance > 0 ? balance : 0
                    });
                }
            }
            
            return balanceArray;
            
        } catch (error) {
            console.error("❌ Failed to calculate balances:", error);
            throw error;
        }
    }
    
    // ============================================
    // SIMPLE MODE - SETTLEMENT TRACKING
    // ============================================
    
    /**
     * Record a settlement (payment between members)
     * @param {Object} settlementInfo Settlement information
     * @returns {Promise<string>} Settlement ID
     */
    async recordSettlement(settlementInfo) {
        try {
            if (!window.FirebaseConfig.isAuthenticated()) {
                throw new Error("User must be authenticated");
            }
            
            // ✅ RATE LIMITING: Prevenir spam de pagos
            await window.checkRateLimit('recordSettlement');
            
            // ✅ VALIDACIÓN Y SANITIZACIÓN: Proteger contra inputs maliciosos
            const validatedInfo = window.Validators.validateSettlementInfo(settlementInfo);
            
            const user = window.FirebaseConfig.getCurrentUser();
            const settlementId = this.generateSettlementId();
            
            const settlement = {
                id: settlementId,
                from: validatedInfo.from,
                to: validatedInfo.to,
                amount: validatedInfo.amount,
                recordedBy: user.uid,
                recordedAt: Date.now(),
                method: validatedInfo.method || 'cash', // cash, bank_transfer, etc
                notes: validatedInfo.notes || ''
            };
            
            // Write to Firebase
            await window.FirebaseConfig.writeDb(
                `groups/${this.currentGroupId}/settlements/${settlementId}`,
                settlement
            );
            
            
            // 🔔 NOTIFICATION: Notify the person who received the payment
            try {
                const groupSnapshot = await window.FirebaseConfig.readDb(`groups/${this.currentGroupId}`);
                const groupData = groupSnapshot || {};
                const fromMember = groupData.members?.[settlement.from];
                const fromName = fromMember?.name || fromMember?.email || 'Someone';
                
                const notificationData = {
                    type: 'payment_received',
                    title: 'Payment Received',
                    message: `${fromName} paid you ${settlement.amount} ${groupData.currency || 'USD'}`,
                    fundId: this.currentGroupId
                };
                
                if (typeof createNotification === 'function') {
                    await createNotification(settlement.to, notificationData);
                }
            } catch (notifError) {
                console.error('Error sending payment notification:', notifError);
                // Don't fail the settlement if notification fails
            }
            
            // ✅ REGISTRAR ACCIÓN: Para rate limiting
            await window.recordRateLimitAction('recordSettlement');
            
            return settlementId;
            
        } catch (error) {
            console.error("❌ Failed to record settlement:", error);
            throw error;
        }
    }
    
    // ============================================
    // BLOCKCHAIN MODE - WRAPPER FUNCTIONS
    // ============================================
    
    /**
     * Load Blockchain Mode group data
     * @param {string} contractAddress Contract address
     * @returns {Promise<Object>} Group data
     */
    async loadBlockchainGroup(contractAddress) {
        try {
            // This will use existing blockchain functions from app-platform.js
            // Just return a wrapper object
            return {
                address: contractAddress,
                mode: MODE_TYPES.BLOCKCHAIN
            };
        } catch (error) {
            console.error("❌ Failed to load blockchain group:", error);
            throw error;
        }
    }
    
    // ============================================
    // MIGRATION - SIMPLE TO BLOCKCHAIN
    // ============================================
    
    /**
     * Upgrade Simple Mode group to Blockchain Mode
     * @returns {Promise<string>} New contract address
     */
    async upgradeToBlockchain() {
        try {
            if (this.currentMode !== MODE_TYPES.SIMPLE) {
                throw new Error("Can only upgrade Simple Mode groups");
            }
            
            
            // Check if user has wallet connected
            if (!window.ethereum) {
                throw new Error("Wallet required for blockchain mode");
            }
            
            // Create blockchain group with same data
            const groupData = this.groupData;
            
            // This will call existing createFund function from app-platform.js
            // We'll need to integrate this later
            
            throw new Error("Migration feature coming soon");
            
        } catch (error) {
            console.error("❌ Failed to upgrade to blockchain:", error);
            throw error;
        }
    }
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    generateGroupId() {
        return `grp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateExpenseId() {
        return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateSettlementId() {
        return `stl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    isSimpleMode() {
        return this.currentMode === MODE_TYPES.SIMPLE;
    }
    
    isBlockchainMode() {
        return this.currentMode === MODE_TYPES.BLOCKCHAIN;
    }
    
    getCurrentMode() {
        return this.currentMode;
    }
    
    /**
     * Export expenses to CSV file
     */
    async exportExpensesToCSV() {
        try {
            if (!this.currentGroupId) {
                throw new Error("No group selected");
            }
            
            // Get group info
            const groupData = await window.FirebaseConfig.readDb(`groups/${this.currentGroupId}`);
            const groupName = groupData?.name || 'Group';
            
            // Get expenses
            const expenses = await window.FirebaseConfig.readDb(
                `groups/${this.currentGroupId}/expenses`
            );
            
            if (!expenses || Object.keys(expenses).length === 0) {
                throw new Error("No expenses to export");
            }
            
            const expenseList = Object.entries(expenses).map(([id, expense]) => ({
                id,
                ...expense
            }));
            
            // Sort by date (newest first)
            expenseList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            
            // CSV Headers
            const headers = [
                'Date',
                'Description',
                'Amount',
                'Currency',
                'Category',
                'Paid By',
                'Split Between',
                'Status',
                'Notes'
            ];
            
            // Format category names
            const categoryLabels = {
                food: '🍔 Food & Drinks',
                transport: '🚗 Transport',
                housing: '🏠 Housing',
                utilities: '💡 Utilities',
                entertainment: '🎬 Entertainment',
                shopping: '🛒 Shopping',
                health: '⚕️ Health',
                travel: '✈️ Travel',
                subscription: '📱 Subscription',
                other: '📦 Other'
            };
            
            // Build CSV rows
            const rows = expenseList.map(expense => {
                const date = expense.timestamp 
                    ? new Date(expense.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })
                    : 'N/A';
                
                const description = (expense.description || '').replace(/"/g, '""');
                const amount = expense.amount || 0;
                const currency = expense.currency || 'USD';
                const category = categoryLabels[expense.category] || expense.category || 'Other';
                const paidBy = expense.paidByName || expense.paidBy || 'Unknown';
                
                // Split between members
                let splitBetween = 'All members';
                if (expense.splitBetween && Array.isArray(expense.splitBetween)) {
                    splitBetween = expense.splitBetween.map(m => m.name || m).join(', ');
                }
                
                const status = expense.status || 'pending';
                const notes = (expense.notes || '').replace(/"/g, '""');
                
                return [
                    date,
                    `"${description}"`,
                    amount.toFixed(2),
                    currency,
                    `"${category}"`,
                    `"${paidBy}"`,
                    `"${splitBetween}"`,
                    status,
                    `"${notes}"`
                ].join(',');
            });
            
            // Add summary section
            const totalByStatus = {
                approved: 0,
                pending: 0,
                rejected: 0
            };
            
            expenseList.forEach(exp => {
                const status = exp.status || 'pending';
                totalByStatus[status] = (totalByStatus[status] || 0) + (exp.amount || 0);
            });
            
            // Build final CSV
            const csvContent = [
                `# ${groupName} - Expense Report`,
                `# Generated: ${new Date().toLocaleString()}`,
                `# Total Expenses: ${expenseList.length}`,
                '',
                headers.join(','),
                ...rows,
                '',
                '# Summary',
                `Total Approved,${totalByStatus.approved.toFixed(2)}`,
                `Total Pending,${totalByStatus.pending.toFixed(2)}`,
                `Total Rejected,${totalByStatus.rejected.toFixed(2)}`
            ].join('\n');
            
            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            const fileName = `${groupName.replace(/[^a-z0-9]/gi, '_')}_expenses_${new Date().toISOString().split('T')[0]}.csv`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log(`✅ Exported ${expenseList.length} expenses to ${fileName}`);
            return true;
            
        } catch (error) {
            console.error("❌ Failed to export expenses:", error);
            throw error;
        }
    }
}

// ============================================
// GLOBAL INSTANCE
// ============================================

window.modeManager = new ModeManager();
