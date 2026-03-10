/**
 * Subscription Manager - Freemium System
 * Manages user subscription tiers and feature access control
 * 
 * @version 1.1.0 - Added Personal Finance tiers (Phase 5-6)
 */

// ============================================================================
// LAUNCH MODE - Set to false when ready to enforce restrictions
// ============================================================================
const LAUNCH_MODE = true; // All users are PRO during launch period

// ============================================================================
// SUBSCRIPTION TIERS & LIMITS
// ============================================================================
const SUBSCRIPTION_TIERS = {
    FREE: 'free',
    PRO: 'pro'
};

const TIER_LIMITS = {
    free: {
        // Group limits
        maxGroups: 3,
        maxMembersPerGroup: 7,
        maxWeeklyChests: 1,
        allowedMinigames: 2,
        
        // Group features
        analytics: false,
        recurringExpenses: false,
        budget: false,
        advancedCharts: false,
        watermark: true,
        exportData: false,
        
        // Personal Finance (Phase 5-6)
        personalColony: true,              // Access to personal colony
        personalBudgetCategories: 3,       // food, transport, other
        personalPortfolioAssets: 3,        // stocks, crypto, cash
        personalGoals: 1,                  // One active goal
        personalInsights: false,           // Basic totals only
        personalExport: false              // No export
    },
    pro: {
        // Group limits
        maxGroups: 100,
        maxMembersPerGroup: 100,
        maxWeeklyChests: 2,
        allowedMinigames: 7,
        
        // Group features
        analytics: true,
        recurringExpenses: true,
        budget: true,
        advancedCharts: true,
        watermark: false,
        exportData: true,
        
        // Personal Finance (Phase 5-6)
        personalColony: true,              // Full access
        personalBudgetCategories: 10,      // All categories
        personalPortfolioAssets: 8,        // All asset types
        personalGoals: Infinity,           // Unlimited goals
        personalInsights: true,            // Full analytics & trends
        personalExport: true               // PDF/CSV export
    }
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================
const FEATURES = {
    // Group features
    MULTIPLE_GROUPS: 'multiple_groups',
    UNLIMITED_MEMBERS: 'unlimited_members',
    ANALYTICS: 'analytics',
    RECURRING_EXPENSES: 'recurring_expenses',
    BUDGET: 'budget',
    ADVANCED_CHARTS: 'advanced_charts',
    ALL_MINIGAMES: 'all_minigames',
    MULTIPLE_CHESTS: 'multiple_chests',
    EXPORT_DATA: 'export_data',
    NO_WATERMARK: 'no_watermark',
    
    // Personal Finance features (Phase 5-6)
    PERSONAL_FULL_BUDGET: 'personal_full_budget',
    PERSONAL_FULL_PORTFOLIO: 'personal_full_portfolio',
    PERSONAL_UNLIMITED_GOALS: 'personal_unlimited_goals',
    PERSONAL_INSIGHTS: 'personal_insights',
    PERSONAL_EXPORT: 'personal_export'
};

// Minigames configuration
const MINIGAMES_CONFIG = {
    free: {
        attended: ['memoryMatch'], // Only 1: Memory Match
        unattended: ['treasureHunt'] // Only 1: Treasure Hunt
    },
    pro: {
        attended: ['memoryMatch', 'wordScramble', 'mathQuiz', 'colorSwap'],
        unattended: ['treasureHunt', 'luckyWheel', 'scratchCard']
    }
};

// ============================================================================
// PERSONAL FINANCE CATEGORIES (Phase 5-6)
// ============================================================================
const PERSONAL_BUDGET_CATEGORIES = {
    free: ['food', 'transport', 'other'],  // 3 basic categories
    pro: ['food', 'transport', 'housing', 'utilities', 'entertainment', 
          'shopping', 'health', 'travel', 'subscription', 'other']  // All 10
};

const PERSONAL_PORTFOLIO_ASSETS = {
    free: ['stocks', 'crypto', 'cash'],  // 3 popular assets
    pro: ['stocks', 'crypto', 'real_estate', 'bonds', 'cash', 
          'retirement', 'commodities', 'other']  // All 8
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get user's subscription data from Firebase
 */
async function getSubscriptionData(userId) {
    if (!userId) {
        console.warn('[Subscription] No userId provided');
        return { tier: SUBSCRIPTION_TIERS.FREE, status: 'active' };
    }

    try {
        const snapshot = await firebase.database()
            .ref(`users/${userId}/subscription`)
            .once('value');
        
        const data = snapshot.val();
        
        if (!data) {
            // No subscription data = free tier
            return {
                tier: SUBSCRIPTION_TIERS.FREE,
                status: 'active',
                startedAt: Date.now(),
                expiresAt: null
            };
        }

        return data;
    } catch (error) {
        console.error('[Subscription] Error fetching data:', error);
        return { tier: SUBSCRIPTION_TIERS.FREE, status: 'active' };
    }
}

/**
 * Check if user has PRO subscription
 */
async function isPro(userId) {
    if (LAUNCH_MODE) {
        // LAUNCH_MODE active - all users have PRO access
        return true;
    }

    if (!userId) return false;

    try {
        const subData = await getSubscriptionData(userId);
        const isActive = subData.status === 'active' || subData.status === 'trial';
        const isPro = subData.tier === SUBSCRIPTION_TIERS.PRO;

        // Check expiration if exists
        if (subData.expiresAt && Date.now() > subData.expiresAt) {
            console.log('[Subscription] Subscription expired');
            return false;
        }

        return isPro && isActive;
    } catch (error) {
        console.error('[Subscription] Error checking PRO status:', error);
        return false;
    }
}

/**
 * Get user's subscription tier
 */
async function getUserTier(userId) {
    if (LAUNCH_MODE) {
        return SUBSCRIPTION_TIERS.PRO;
    }

    const subData = await getSubscriptionData(userId);
    return subData.tier || SUBSCRIPTION_TIERS.FREE;
}

/**
 * Get limits for user's tier
 */
async function getTierLimits(userId) {
    const tier = await getUserTier(userId);
    return TIER_LIMITS[tier];
}

// ============================================================================
// FEATURE ACCESS VALIDATION
// ============================================================================

/**
 * Check if user can create a new group
 */
async function canCreateGroup(userId) {
    if (LAUNCH_MODE) {
        return { allowed: true, reason: null };
    }

    const limits = await getTierLimits(userId);
    
    // Count user's existing groups (only groups they CREATED, not member of)
    const snapshot = await firebase.database()
        .ref('groups')
        .orderByChild('createdBy')
        .equalTo(userId)
        .once('value');
    
    let groupCount = 0;
    snapshot.forEach((childSnapshot) => {
        const group = childSnapshot.val();
        // Only count groups where user is actually the creator
        if (group && group.createdBy === userId) {
            groupCount++;
        }
    });
    
    // Debug: console.log(`[Subscription] User ${userId} has ${groupCount}/${limits.maxGroups} groups`);
    
    if (groupCount >= limits.maxGroups) {
        return {
            allowed: false,
            reason: `You've reached the limit of ${limits.maxGroups} groups. Upgrade to PRO for unlimited groups!`,
            limit: limits.maxGroups,
            current: groupCount
        };
    }

    return { allowed: true, reason: null };
}

/**
 * Check if user can add member to group
 */
async function canAddMember(userId, groupId) {
    if (LAUNCH_MODE) {
        return { allowed: true, reason: null };
    }

    const limits = await getTierLimits(userId);
    
    // Count group members
    const snapshot = await firebase.database()
        .ref(`groups/${groupId}/members`)
        .once('value');
    
    const memberCount = snapshot.numChildren();
    
    if (memberCount >= limits.maxMembersPerGroup) {
        return {
            allowed: false,
            reason: `This group has reached the limit of ${limits.maxMembersPerGroup} members. Upgrade to PRO for up to 100 members!`,
            limit: limits.maxMembersPerGroup,
            current: memberCount
        };
    }

    return { allowed: true, reason: null };
}

/**
 * Check if feature is accessible to user
 */
async function canAccessFeature(userId, feature) {
    if (LAUNCH_MODE) {
        return { allowed: true, reason: null };
    }

    const userIsPro = await isPro(userId);
    const limits = await getTierLimits(userId);

    const featureChecks = {
        // Group features
        [FEATURES.ANALYTICS]: {
            allowed: limits.analytics,
            reason: 'Analytics is a PRO feature. Upgrade to track your spending patterns!'
        },
        [FEATURES.RECURRING_EXPENSES]: {
            allowed: limits.recurringExpenses,
            reason: 'Recurring expenses is a PRO feature. Upgrade to automate your regular expenses!'
        },
        [FEATURES.BUDGET]: {
            allowed: limits.budget,
            reason: 'Budget tracking is a PRO feature. Upgrade to set spending limits!'
        },
        [FEATURES.ADVANCED_CHARTS]: {
            allowed: limits.advancedCharts,
            reason: 'Advanced charts are a PRO feature. Upgrade to visualize your data!'
        },
        [FEATURES.ALL_MINIGAMES]: {
            allowed: userIsPro,
            reason: 'All minigames are available in PRO. Free users get 2 minigames!'
        },
        [FEATURES.MULTIPLE_CHESTS]: {
            allowed: userIsPro,
            reason: 'Multiple weekly chests are a PRO feature. Upgrade for more rewards!'
        },
        [FEATURES.EXPORT_DATA]: {
            allowed: limits.exportData,
            reason: 'Data export is a PRO feature. Upgrade to download your data!'
        },
        [FEATURES.NO_WATERMARK]: {
            allowed: !limits.watermark,
            reason: 'Remove watermark with PRO subscription!'
        },
        
        // Personal Finance features (Phase 5-6)
        [FEATURES.PERSONAL_FULL_BUDGET]: {
            allowed: limits.personalBudgetCategories >= 10,
            reason: 'Unlock all 10 budget categories with PRO! Free includes Food, Transport & Other.'
        },
        [FEATURES.PERSONAL_FULL_PORTFOLIO]: {
            allowed: limits.personalPortfolioAssets >= 8,
            reason: 'Track Real Estate, Bonds, Retirement & more with PRO! Free includes Stocks, Crypto & Cash.'
        },
        [FEATURES.PERSONAL_UNLIMITED_GOALS]: {
            allowed: limits.personalGoals === Infinity,
            reason: 'Create unlimited savings goals with PRO! Free users get 1 active goal.'
        },
        [FEATURES.PERSONAL_INSIGHTS]: {
            allowed: limits.personalInsights,
            reason: 'Unlock spending trends and financial insights with PRO!'
        },
        [FEATURES.PERSONAL_EXPORT]: {
            allowed: limits.personalExport,
            reason: 'Export your personal finance data as PDF/CSV with PRO!'
        }
    };

    const check = featureChecks[feature];
    if (!check) {
        console.warn('[Subscription] Unknown feature:', feature);
        return { allowed: false, reason: 'Unknown feature' };
    }

    return check;
}

/**
 * Get allowed minigames for user
 */
async function getAllowedMinigames(userId) {
    if (LAUNCH_MODE) {
        return {
            attended: MINIGAMES_CONFIG.pro.attended,
            unattended: MINIGAMES_CONFIG.pro.unattended,
            total: 7
        };
    }

    const tier = await getUserTier(userId);
    const config = MINIGAMES_CONFIG[tier];

    return {
        attended: config.attended,
        unattended: config.unattended,
        total: config.attended.length + config.unattended.length
    };
}

/**
 * Check if user can access specific minigame
 */
async function canPlayMinigame(userId, gameId) {
    if (LAUNCH_MODE) {
        return { allowed: true, reason: null };
    }

    const allowed = await getAllowedMinigames(userId);
    const allAllowed = [...allowed.attended, ...allowed.unattended];

    if (allAllowed.includes(gameId)) {
        return { allowed: true, reason: null };
    }

    return {
        allowed: false,
        reason: 'This minigame is only available for PRO users. Upgrade to unlock all games!',
        allowedGames: allAllowed
    };
}

// ============================================================================
// PERSONAL FINANCE VALIDATION (Phase 5-6)
// ============================================================================

/**
 * Get allowed budget categories for user's tier
 */
async function getPersonalBudgetCategories(userId) {
    if (LAUNCH_MODE) {
        return {
            categories: PERSONAL_BUDGET_CATEGORIES.pro,
            limit: 10,
            isPro: true
        };
    }

    const tier = await getUserTier(userId);
    return {
        categories: PERSONAL_BUDGET_CATEGORIES[tier],
        limit: TIER_LIMITS[tier].personalBudgetCategories,
        isPro: tier === SUBSCRIPTION_TIERS.PRO
    };
}

/**
 * Get allowed portfolio assets for user's tier
 */
async function getPersonalPortfolioAssets(userId) {
    if (LAUNCH_MODE) {
        return {
            assets: PERSONAL_PORTFOLIO_ASSETS.pro,
            limit: 8,
            isPro: true
        };
    }

    const tier = await getUserTier(userId);
    return {
        assets: PERSONAL_PORTFOLIO_ASSETS[tier],
        limit: TIER_LIMITS[tier].personalPortfolioAssets,
        isPro: tier === SUBSCRIPTION_TIERS.PRO
    };
}

/**
 * Check if user can add a budget category
 */
async function canAddBudgetCategory(userId, categoryId) {
    if (LAUNCH_MODE) {
        return { allowed: true, reason: null };
    }

    const { categories, limit } = await getPersonalBudgetCategories(userId);
    
    if (categories.includes(categoryId)) {
        return { allowed: true, reason: null };
    }

    return {
        allowed: false,
        reason: `This category is PRO only. Free users can track: ${categories.join(', ')}`,
        allowedCategories: categories,
        limit
    };
}

/**
 * Check if user can add a portfolio asset type
 */
async function canAddPortfolioAsset(userId, assetType) {
    if (LAUNCH_MODE) {
        return { allowed: true, reason: null };
    }

    const { assets, limit } = await getPersonalPortfolioAssets(userId);
    
    if (assets.includes(assetType)) {
        return { allowed: true, reason: null };
    }

    return {
        allowed: false,
        reason: `This asset type is PRO only. Free users can track: ${assets.join(', ')}`,
        allowedAssets: assets,
        limit
    };
}

/**
 * Check if user can add another personal goal
 */
async function canAddPersonalGoal(userId) {
    if (LAUNCH_MODE) {
        return { allowed: true, reason: null, limit: Infinity };
    }

    const limits = await getTierLimits(userId);
    
    // Count existing goals
    const snapshot = await firebase.database()
        .ref(`users/${userId}/personalFinance/goals`)
        .once('value');
    
    const currentGoals = snapshot.numChildren();
    
    if (currentGoals >= limits.personalGoals) {
        return {
            allowed: false,
            reason: `You've reached your limit of ${limits.personalGoals} goal(s). Upgrade to PRO for unlimited goals!`,
            current: currentGoals,
            limit: limits.personalGoals
        };
    }

    return { allowed: true, reason: null, current: currentGoals, limit: limits.personalGoals };
}

/**
 * Check if user can access personal insights
 */
async function canAccessPersonalInsights(userId) {
    if (LAUNCH_MODE) {
        return { allowed: true, reason: null };
    }

    const limits = await getTierLimits(userId);
    
    if (!limits.personalInsights) {
        return {
            allowed: false,
            reason: 'Spending trends and financial insights are PRO features. Upgrade to visualize your finances!'
        };
    }

    return { allowed: true, reason: null };
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Show upgrade modal to user
 */
function showUpgradeModal(feature = null) {
    const featureMessages = {
        // Group features
        [FEATURES.MULTIPLE_GROUPS]: 'Create unlimited groups',
        [FEATURES.UNLIMITED_MEMBERS]: 'Add up to 100 members per group',
        [FEATURES.ANALYTICS]: 'Access detailed analytics',
        [FEATURES.RECURRING_EXPENSES]: 'Automate recurring expenses',
        [FEATURES.BUDGET]: 'Set and track budgets',
        [FEATURES.ADVANCED_CHARTS]: 'View advanced charts',
        [FEATURES.ALL_MINIGAMES]: 'Play all 7 minigames',
        [FEATURES.MULTIPLE_CHESTS]: 'Open multiple weekly chests',
        [FEATURES.EXPORT_DATA]: 'Export your data',
        [FEATURES.NO_WATERMARK]: 'Remove watermark',
        
        // Personal Finance features
        [FEATURES.PERSONAL_FULL_BUDGET]: 'Track all 10 budget categories',
        [FEATURES.PERSONAL_FULL_PORTFOLIO]: 'Track all investment types',
        [FEATURES.PERSONAL_UNLIMITED_GOALS]: 'Create unlimited savings goals',
        [FEATURES.PERSONAL_INSIGHTS]: 'View spending trends & insights',
        [FEATURES.PERSONAL_EXPORT]: 'Export personal finance data'
    };

    const message = feature && featureMessages[feature] 
        ? `Upgrade to PRO to ${featureMessages[feature]}!`
        : 'Upgrade to PRO to unlock all features!';

    // Create modal HTML
    const modalHTML = `
        <div class="upgrade-modal-overlay" id="upgradeModal" onclick="window.SubscriptionManager.closeUpgradeModal()">
            <div class="upgrade-modal" onclick="event.stopPropagation()">
                <button class="upgrade-modal-close" onclick="event.stopPropagation(); window.SubscriptionManager.closeUpgradeModal()">×</button>
                <div class="upgrade-modal-content">
                    <div class="upgrade-icon">💎</div>
                    <h2>Upgrade to PRO</h2>
                    <p class="upgrade-message">${message}</p>
                    
                    <div class="upgrade-features">
                        <h3>PRO Benefits:</h3>
                        <ul>
                            <li>✅ Up to 100 groups & 100 members</li>
                            <li>✅ Complete Colony system with better rewards</li>
                            <li>✅ Multiple weekly chests</li>
                            <li>✅ All 7 Challenge Games</li>
                            <li>✅ Advanced analytics & charts</li>
                            <li>✅ Recurring expenses automation</li>
                            <li>✅ Group budget tracking</li>
                            <li>🐜 <strong>Personal Finance:</strong></li>
                            <li>✅ All 10 budget categories</li>
                            <li>✅ Full portfolio (8 asset types)</li>
                            <li>✅ Unlimited savings goals</li>
                            <li>✅ Spending trends & insights</li>
                            <li>✅ Export data (PDF/CSV)</li>
                        </ul>
                    </div>
                    
                    <button class="btn-upgrade-primary" onclick="window.SubscriptionManager.handleUpgrade()">
                        Upgrade Now
                    </button>
                    <button class="btn-upgrade-secondary" onclick="window.SubscriptionManager.closeUpgradeModal()">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existing = document.getElementById('upgradeModal');
    if (existing) existing.remove();

    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Close upgrade modal
 */
function closeUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.remove();
}

/**
 * Handle upgrade button click
 */
async function handleUpgrade() {
    try {
        closeUpgradeModal();
        
        const user = firebase?.auth().currentUser;
        if (!user) {
            alert('Please sign in first to upgrade to PRO');
            return;
        }

        // Show loading
        if (typeof showLoading === 'function') {
            showLoading('Opening checkout...');
        }

        // Call existing Stripe integration
        const createCheckoutSession = firebase.functions().httpsCallable('createStripeCheckoutSession');
        const result = await createCheckoutSession({ 
            customerEmail: user.email,
            successUrl: `${window.location.origin}${window.location.pathname}?payment=success`,
            cancelUrl: `${window.location.origin}${window.location.pathname}?payment=cancelled`
        });

        if (result.data && result.data.url) {
            // Redirect to Stripe Checkout
            window.location.href = result.data.url;
        } else {
            throw new Error('No checkout URL returned');
        }

    } catch (error) {
        console.error('[Subscription] Upgrade error:', error);
        
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        
        if (typeof showToast === 'function') {
            showToast(`Error: ${error.message}`, 'error');
        } else {
            alert(`Error upgrading to PRO: ${error.message}`);
        }
    }
}

/**
 * Add PRO badge to element
 */
function addProBadge(element, position = 'after') {
    if (!element) return;

    const badge = document.createElement('span');
    badge.className = 'pro-badge';
    badge.textContent = 'PRO';
    badge.title = 'This feature requires PRO subscription';
    
    if (position === 'after') {
        element.insertAdjacentElement('afterend', badge);
    } else {
        element.appendChild(badge);
    }
}

/**
 * Get subscription status display
 */
async function getSubscriptionStatus(userId) {
    const subData = await getSubscriptionData(userId);
    const tier = subData.tier || SUBSCRIPTION_TIERS.FREE;
    
    let daysLeft = null;
    if (subData.expiresAt) {
        daysLeft = Math.ceil((subData.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    }

    return {
        tier,
        tierDisplay: tier.toUpperCase(),
        status: subData.status || 'active',
        daysLeft,
        isActive: subData.status === 'active' || subData.status === 'trial',
        isTrial: subData.status === 'trial'
    };
}

// ============================================================================
// ADMIN FUNCTIONS (for testing/management)
// ============================================================================

/**
 * Set user subscription tier (admin only)
 */
async function setUserSubscription(userId, tier, durationDays = null) {
    if (!userId || !Object.values(SUBSCRIPTION_TIERS).includes(tier)) {
        throw new Error('Invalid userId or tier');
    }

    const subscriptionData = {
        tier,
        status: 'active',
        startedAt: Date.now(),
        updatedAt: Date.now()
    };

    if (durationDays) {
        subscriptionData.expiresAt = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
    }

    await firebase.database()
        .ref(`users/${userId}/subscription`)
        .set(subscriptionData);

    console.log(`[Subscription] Set ${userId} to ${tier} tier`);
    return subscriptionData;
}

/**
 * Start trial for user
 */
async function startTrial(userId, durationDays = 14) {
    const subscriptionData = {
        tier: SUBSCRIPTION_TIERS.PRO,
        status: 'trial',
        startedAt: Date.now(),
        expiresAt: Date.now() + (durationDays * 24 * 60 * 60 * 1000),
        updatedAt: Date.now()
    };

    await firebase.database()
        .ref(`users/${userId}/subscription`)
        .set(subscriptionData);

    console.log(`[Subscription] Started ${durationDays}-day trial for ${userId}`);
    return subscriptionData;
}

// ============================================================================
// STRIPE PAYMENT HANDLING
// ============================================================================

/**
 * Handle Stripe payment callback
 * Called when user returns from Stripe checkout
 */
function handleStripeCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
        // Clear URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Show success message
        if (typeof showToast === 'function') {
            showToast('🎉 Welcome to PRO! Your subscription is now active.', 'success');
        } else {
            alert('🎉 Welcome to PRO! Your subscription is now active.');
        }

        // Reload page to reflect PRO status
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } else if (paymentStatus === 'cancelled') {
        // Clear URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (typeof showToast === 'function') {
            showToast('Payment cancelled. You can upgrade anytime!', 'info');
        }
    }
}

// Auto-execute on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', handleStripeCallback);
}

// ============================================================================
// EXPORT
// ============================================================================

window.SubscriptionManager = {
    // Constants
    LAUNCH_MODE,
    SUBSCRIPTION_TIERS,
    TIER_LIMITS,
    FEATURES,
    PERSONAL_BUDGET_CATEGORIES,
    PERSONAL_PORTFOLIO_ASSETS,
    
    // Core functions
    isPro,
    getUserTier,
    getTierLimits,
    getSubscriptionData,
    getSubscriptionStatus,
    
    // Validation functions - Groups
    canCreateGroup,
    canAddMember,
    canAccessFeature,
    canPlayMinigame,
    getAllowedMinigames,
    
    // Validation functions - Personal Finance (Phase 5-6)
    getPersonalBudgetCategories,
    getPersonalPortfolioAssets,
    canAddBudgetCategory,
    canAddPortfolioAsset,
    canAddPersonalGoal,
    canAccessPersonalInsights,
    
    // UI functions
    showUpgradeModal,
    closeUpgradeModal,
    handleUpgrade,
    addProBadge,
    
    // Admin functions
    setUserSubscription,
    startTrial
};

// Subscription Manager loaded - v1.1.0 (Personal Finance Support)
