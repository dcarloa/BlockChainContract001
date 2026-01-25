/**
 * Subscription Manager - Freemium System
 * Manages user subscription tiers and feature access control
 * 
 * @version 1.0.0
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
        maxGroups: 3,
        maxMembersPerGroup: 10,
        maxWeeklyChests: 1, // One chest per week
        allowedMinigames: 2, // 1 attended + 1 unattended
        analytics: false,
        recurringExpenses: false,
        budget: false,
        advancedCharts: false,
        watermark: true,
        exportData: false
    },
    pro: {
        maxGroups: 100, // Security lock
        maxMembersPerGroup: 100, // Security lock
        maxWeeklyChests: 2, // Multiple chest types per week
        allowedMinigames: 7, // All minigames
        analytics: true,
        recurringExpenses: true,
        budget: true,
        advancedCharts: true,
        watermark: false,
        exportData: true
    }
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================
const FEATURES = {
    MULTIPLE_GROUPS: 'multiple_groups',
    UNLIMITED_MEMBERS: 'unlimited_members',
    ANALYTICS: 'analytics',
    RECURRING_EXPENSES: 'recurring_expenses',
    BUDGET: 'budget',
    ADVANCED_CHARTS: 'advanced_charts',
    ALL_MINIGAMES: 'all_minigames',
    MULTIPLE_CHESTS: 'multiple_chests',
    EXPORT_DATA: 'export_data',
    NO_WATERMARK: 'no_watermark'
};

// Minigames configuration
const MINIGAMES_CONFIG = {
    free: {
        attended: ['memoryMatch'], // Only memory match for free
        unattended: ['treasureHunt'] // Only treasure hunt for free
    },
    pro: {
        attended: ['memoryMatch', 'wordScramble', 'mathQuiz', 'colorSwap'],
        unattended: ['treasureHunt', 'luckyWheel', 'scratchCard']
    }
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
        console.log('[Subscription] LAUNCH_MODE: All users are PRO');
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
    
    // Count user's existing groups
    const snapshot = await firebase.database()
        .ref('groups')
        .orderByChild('createdBy')
        .equalTo(userId)
        .once('value');
    
    const groupCount = snapshot.numChildren();
    
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
// UI HELPERS
// ============================================================================

/**
 * Show upgrade modal to user
 */
function showUpgradeModal(feature = null) {
    const featureMessages = {
        [FEATURES.MULTIPLE_GROUPS]: 'Create unlimited groups',
        [FEATURES.UNLIMITED_MEMBERS]: 'Add up to 100 members per group',
        [FEATURES.ANALYTICS]: 'Access detailed analytics',
        [FEATURES.RECURRING_EXPENSES]: 'Automate recurring expenses',
        [FEATURES.BUDGET]: 'Set and track budgets',
        [FEATURES.ADVANCED_CHARTS]: 'View advanced charts',
        [FEATURES.ALL_MINIGAMES]: 'Play all 7 minigames',
        [FEATURES.MULTIPLE_CHESTS]: 'Open multiple weekly chests',
        [FEATURES.EXPORT_DATA]: 'Export your data',
        [FEATURES.NO_WATERMARK]: 'Remove watermark'
    };

    const message = feature && featureMessages[feature] 
        ? `Upgrade to PRO to ${featureMessages[feature]}!`
        : 'Upgrade to PRO to unlock all features!';

    // Create modal HTML
    const modalHTML = `
        <div class="upgrade-modal-overlay" id="upgradeModal">
            <div class="upgrade-modal">
                <button class="upgrade-modal-close" onclick="window.SubscriptionManager.closeUpgradeModal()">×</button>
                <div class="upgrade-modal-content">
                    <div class="upgrade-icon">💎</div>
                    <h2>Upgrade to PRO</h2>
                    <p class="upgrade-message">${message}</p>
                    
                    <div class="upgrade-features">
                        <h3>PRO Benefits:</h3>
                        <ul>
                            <li>✅ Up to 100 groups</li>
                            <li>✅ Up to 100 members per group</li>
                            <li>✅ Complete Colony system with better rewards</li>
                            <li>✅ Multiple weekly chests</li>
                            <li>✅ All 7 Challenge Games</li>
                            <li>✅ Advanced analytics & charts</li>
                            <li>✅ Recurring expenses automation</li>
                            <li>✅ Budget tracking</li>
                            <li>✅ Export data</li>
                            <li>✅ No watermark</li>
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
function handleUpgrade() {
    // TODO: Implement payment integration (Stripe, etc.)
    console.log('[Subscription] Upgrade initiated');
    closeUpgradeModal();
    
    // For now, just show a message
    alert('Payment integration coming soon! Contact support@antpool.cloud for PRO access.');
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
// EXPORT
// ============================================================================

window.SubscriptionManager = {
    // Constants
    LAUNCH_MODE,
    SUBSCRIPTION_TIERS,
    TIER_LIMITS,
    FEATURES,
    
    // Core functions
    isPro,
    getUserTier,
    getTierLimits,
    getSubscriptionData,
    getSubscriptionStatus,
    
    // Validation functions
    canCreateGroup,
    canAddMember,
    canAccessFeature,
    canPlayMinigame,
    getAllowedMinigames,
    
    // UI functions
    showUpgradeModal,
    closeUpgradeModal,
    handleUpgrade,
    addProBadge,
    
    // Admin functions
    setUserSubscription,
    startTrial
};

console.log('✅ Subscription Manager loaded (LAUNCH_MODE:', LAUNCH_MODE, ')');
