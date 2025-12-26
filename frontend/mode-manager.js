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
            
            console.log(`🎯 Initialized ${this.currentMode} mode for group:`, groupId);
            
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
            
            const user = window.FirebaseConfig.getCurrentUser();
            const groupId = this.generateGroupId();
            
            const groupData = {
                id: groupId,
                name: groupInfo.name,
                description: groupInfo.description || '',
                mode: MODE_TYPES.SIMPLE,
                createdBy: user.uid,
                createdByEmail: user.email,
                createdByName: user.displayName || user.email,
                createdAt: Date.now(),
                isActive: true,
                targetAmount: groupInfo.targetAmount || 0,
                currency: groupInfo.currency || 'USD',
                
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
                name: groupInfo.name,
                role: 'creator',
                joinedAt: Date.now()
            });
            
            console.log("✅ Simple group created:", groupId);
            return groupId;
            
        } catch (error) {
            console.error("❌ Failed to create simple group:", error);
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
            
            const user = window.FirebaseConfig.getCurrentUser();
            const expenseId = this.generateExpenseId();
            const timestamp = Date.now();
            
            const expense = {
                id: expenseId,
                description: expenseInfo.description,
                amount: expenseInfo.amount,
                paidBy: expenseInfo.paidBy || user.uid,
                paidByName: expenseInfo.paidByName || user.displayName || user.email,
                splitBetween: expenseInfo.splitBetween, // Array of user IDs
                timestamp: timestamp,
                createdAt: timestamp,
                date: expenseInfo.date || new Date().toISOString().split('T')[0],
                currency: expenseInfo.currency || 'USD', // Add currency field
                
                // No approval system - expenses are immediately accepted
                status: 'approved',
                
                // Metadata
                category: expenseInfo.category || 'other',
                receipt: expenseInfo.receipt || null,
                notes: expenseInfo.notes || ''
            };
            
            // Write expense to Firebase
            await window.FirebaseConfig.writeDb(
                `groups/${this.currentGroupId}/expenses/${expenseId}`,
                expense
            );
            
            console.log("✅ Expense added:", expenseId);
            return expenseId;
            
        } catch (error) {
            console.error("❌ Failed to add expense:", error);
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
            
            console.log("✅ Expense approval recorded");
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
            console.log('🔍 Calculating balances for group:', this.currentGroupId);
            console.log('👥 Group data:', this.groupData);
            
            // Load all approved expenses
            const expensesData = await window.FirebaseConfig.readDb(
                `groups/${this.currentGroupId}/expenses`
            );
            
            console.log('💸 Expenses data:', expensesData);
            
            if (!expensesData) {
                console.log('⚠️ No expenses found');
                return [];
            }
            
            // Log all expense statuses
            Object.entries(expensesData).forEach(([id, exp]) => {
                console.log(`📝 Expense ${id.slice(-8)}: status="${exp.status}", amount=$${exp.amount}, desc="${exp.description}"`);
            });
            
            // In Simple Mode, ALL expenses count (no approval needed)
            const expenses = Object.values(expensesData);
            
            console.log('✅ Total expenses to process:', expenses.length);
            
            // Calculate net balances
            const balances = {};
            
            // Initialize all members
            const members = Object.keys(this.groupData.members);
            console.log('👥 Members to initialize:', members);
            members.forEach(memberId => {
                balances[memberId] = 0;
            });
            
            // Process each expense
            for (const expense of expenses) {
                const paidBy = expense.paidBy;
                let amount = Number(expense.amount);
                
                // Convert amount to USD if needed
                const currency = expense.currency || 'USD';
                if (currency !== 'USD' && window.convertToUSD) {
                    amount = await window.convertToUSD(amount, currency);
                    console.log(`💱 Converted ${expense.amount} ${currency} to ${amount.toFixed(2)} USD for balance calculation`);
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
            console.log('📊 Raw balances:', balances);
            
            for (const [memberId, balance] of Object.entries(balances)) {
                console.log(`  Member ${memberId}: balance = ${balance}`);
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
            
            console.log("✅ Balances calculated:", balanceArray.length, "members with non-zero balance");
            console.log("📋 Balance array:", balanceArray);
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
            
            const user = window.FirebaseConfig.getCurrentUser();
            const settlementId = this.generateSettlementId();
            
            const settlement = {
                id: settlementId,
                from: settlementInfo.from,
                to: settlementInfo.to,
                amount: settlementInfo.amount,
                recordedBy: user.uid,
                recordedAt: Date.now(),
                method: settlementInfo.method || 'cash', // cash, bank_transfer, etc
                notes: settlementInfo.notes || ''
            };
            
            // Write to Firebase
            await window.FirebaseConfig.writeDb(
                `groups/${this.currentGroupId}/settlements/${settlementId}`,
                settlement
            );
            
            console.log("✅ Settlement recorded:", settlementId);
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
            
            console.log("🚀 Starting migration to blockchain...");
            
            // Check if user has wallet connected
            if (!window.ethereum) {
                throw new Error("Wallet required for blockchain mode");
            }
            
            // Create blockchain group with same data
            const groupData = this.groupData;
            
            // This will call existing createFund function from app-platform.js
            // We'll need to integrate this later
            console.log("📝 Group ready for migration:", groupData);
            
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
}

// ============================================
// GLOBAL INSTANCE
// ============================================

window.modeManager = new ModeManager();
console.log("✅ Mode Manager initialized");
