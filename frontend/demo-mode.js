/**
 * Demo Mode System for Ant Pool
 * Allows unauthenticated users to explore the app with sample data
 */

// ============================================
// IMMEDIATE DEMO MODE DETECTION
// Must run synchronously before any other scripts
// ============================================
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
        // Set global flag immediately
        window.__DEMO_MODE_REQUESTED__ = true;
        console.log('🎮 Demo mode requested via URL');
    }
})();

// ============================================
// DEMO MODE STATE
// ============================================
let isDemoMode = window.__DEMO_MODE_REQUESTED__ || false;
let originalTabsHTML = null; // Store original tabs to restore when switching views

// ============================================
// DEMO DATA - Sample Simple Mode group (NOT blockchain)
// Structure matches exactly what loadUserFunds() creates for Simple Mode
// ============================================
const DEMO_GROUP_DATA = {
    // These fields match the fundData structure in app-platform.js line ~1337
    fundAddress: 'demo-roommates-2026', // groupId used as identifier
    fundName: 'Apartment Expenses',
    name: 'Apartment Expenses', // Alias for consistency
    description: 'Monthly shared expenses with roommates',
    icon: '🏠',
    fundType: 3, // 3 = Other (Simple Mode always uses this)
    mode: 'simple', // CRITICAL: This is a Simple Mode group
    currency: 'USD',
    primaryCurrency: 'USD',
    isActive: true,
    isCreator: true,
    isParticipant: true,
    createdAt: Date.now() - (14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    createdBy: 'demo-user-carlos',
    createdByEmail: 'carlos@example.com',
    memberCount: 3,
    
    // Demo members (3 roommates)
    members: {
        'demo-user-carlos': {
            name: 'Carlos',
            email: 'carlos@example.com',
            joinedAt: Date.now() - (14 * 24 * 60 * 60 * 1000),
            role: 'creator'
        },
        'demo-user-maria': {
            name: 'María',
            email: 'maria@example.com',
            joinedAt: Date.now() - (14 * 24 * 60 * 60 * 1000),
            role: 'member'
        },
        'demo-user-juan': {
            name: 'Juan',
            email: 'juan@example.com',
            joinedAt: Date.now() - (14 * 24 * 60 * 60 * 1000),
            role: 'member'
        }
    },
    
    // Demo expenses (typical roommate expenses)
    expenses: {
        'demo-expense-1': {
            id: 'demo-expense-1',
            description: 'Electricity bill - February',
            amount: 85,
            currency: 'USD',
            paidBy: ['demo-user-carlos'],
            paidByAmounts: { 'demo-user-carlos': 85 },
            participants: ['demo-user-carlos', 'demo-user-maria', 'demo-user-juan'],
            createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000),
            createdBy: 'demo-user-carlos',
            status: 'approved',
            category: 'utilities'
        },
        'demo-expense-2': {
            id: 'demo-expense-2',
            description: 'Internet - Monthly',
            amount: 60,
            currency: 'USD',
            paidBy: ['demo-user-maria'],
            paidByAmounts: { 'demo-user-maria': 60 },
            participants: ['demo-user-carlos', 'demo-user-maria', 'demo-user-juan'],
            createdAt: Date.now() - (8 * 24 * 60 * 60 * 1000),
            createdBy: 'demo-user-maria',
            status: 'approved',
            category: 'utilities'
        },
        'demo-expense-3': {
            id: 'demo-expense-3',
            description: 'Groceries 🛒',
            amount: 120,
            currency: 'USD',
            paidBy: ['demo-user-juan'],
            paidByAmounts: { 'demo-user-juan': 120 },
            participants: ['demo-user-carlos', 'demo-user-maria', 'demo-user-juan'],
            createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
            createdBy: 'demo-user-juan',
            status: 'approved',
            category: 'food'
        },
        'demo-expense-4': {
            id: 'demo-expense-4',
            description: 'Cleaning supplies',
            amount: 35,
            currency: 'USD',
            paidBy: ['demo-user-carlos'],
            paidByAmounts: { 'demo-user-carlos': 35 },
            participants: ['demo-user-carlos', 'demo-user-maria', 'demo-user-juan'],
            createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
            createdBy: 'demo-user-carlos',
            status: 'approved',
            category: 'other'
        }
    },
    
    // Demo mascot
    mascot: {
        name: 'Antony',
        hat: 'sombrero',
        outfit: 'hawaiian',
        accessory: 'sunglasses',
        level: 2
    },
    
    // Colony status
    colonyStatus: 'growing'
};

// Demo user for the viewer
const DEMO_CURRENT_USER = {
    uid: 'demo-viewer',
    displayName: 'You (Demo)',
    email: 'demo@antpool.cloud'
};

// ============================================
// DEMO PERSONAL COLONY DATA
// Shows personal finance features to new users
// ============================================
const DEMO_PERSONAL_COLONY_DATA = {
    fundAddress: 'demo-personal-colony',
    fundName: 'Your Finances',
    name: 'Personal Colony',
    description: 'Track your personal budget, investments and goals',
    icon: '🏠',
    mode: 'personal',
    currency: 'USD',
    primaryCurrency: 'USD',
    isActive: true,
    isPersonalColony: true,
    memberCount: 1,
    
    // Demo budget data for current month
    budget: {
        'food': {
            id: 'food',
            name: 'Food & Dining',
            emoji: '🍔',
            limit: 500,
            spent: 342.50,
            color: '#f97316'
        },
        'transport': {
            id: 'transport',
            name: 'Transportation',
            emoji: '🚗',
            limit: 200,
            spent: 85.00,
            color: '#3b82f6'
        },
        'entertainment': {
            id: 'entertainment',
            name: 'Entertainment',
            emoji: '🎬',
            limit: 150,
            spent: 127.99,
            color: '#a855f7'
        },
        'shopping': {
            id: 'shopping',
            name: 'Shopping',
            emoji: '🛍️',
            limit: 300,
            spent: 189.00,
            color: '#ec4899'
        },
        'bills': {
            id: 'bills',
            name: 'Bills & Utilities',
            emoji: '💡',
            limit: 400,
            spent: 380.00,
            color: '#14b8a6'
        }
    },
    
    // Demo portfolio data
    portfolio: {
        'stocks': {
            id: 'stocks',
            name: 'Stocks',
            emoji: '📈',
            value: 12500,
            invested: 10000,
            change: 25.00,
            changePercent: 25.00
        },
        'crypto': {
            id: 'crypto',
            name: 'Cryptocurrency',
            emoji: '₿',
            value: 3200,
            invested: 2500,
            change: 700,
            changePercent: 28.00
        },
        'savings': {
            id: 'savings',
            name: 'Savings',
            emoji: '🏦',
            value: 8500,
            invested: 8500,
            change: 0,
            changePercent: 0
        },
        'bonds': {
            id: 'bonds',
            name: 'Bonds',
            emoji: '📜',
            value: 5150,
            invested: 5000,
            change: 150,
            changePercent: 3.00
        }
    },
    
    // Demo financial goals
    goals: [
        {
            id: 'vacation',
            name: 'Summer Vacation',
            emoji: '🏖️',
            target: 3000,
            saved: 1850,
            deadline: '2026-07-01'
        },
        {
            id: 'emergency',
            name: 'Emergency Fund',
            emoji: '🆘',
            target: 10000,
            saved: 6500,
            deadline: null
        },
        {
            id: 'laptop',
            name: 'New Laptop',
            emoji: '💻',
            target: 1500,
            saved: 900,
            deadline: '2026-05-01'
        }
    ],
    
    // Demo recent transactions for personal expenses
    expenses: {
        'personal-1': {
            id: 'personal-1',
            description: 'Grocery shopping',
            amount: 85.50,
            currency: 'USD',
            category: 'food',
            createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000)
        },
        'personal-2': {
            id: 'personal-2',
            description: 'Netflix subscription',
            amount: 15.99,
            currency: 'USD',
            category: 'entertainment',
            createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000)
        },
        'personal-3': {
            id: 'personal-3',
            description: 'Gas station',
            amount: 45.00,
            currency: 'USD',
            category: 'transport',
            createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000)
        },
        'personal-4': {
            id: 'personal-4',
            description: 'Electric bill',
            amount: 120.00,
            currency: 'USD',
            category: 'bills',
            createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000)
        },
        'personal-5': {
            id: 'personal-5',
            description: 'New shoes',
            amount: 89.00,
            currency: 'USD',
            category: 'shopping',
            createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000)
        }
    }
};

// ============================================
// DEMO MODE FUNCTIONS
// ============================================

/**
 * Check if currently in demo mode
 */
function isInDemoMode() {
    return isDemoMode;
}

/**
 * Enter demo mode - called when unauthenticated user tries to use the app
 */
function enterDemoMode() {
    // CRITICAL: Don't enter demo mode if user is already authenticated
    if (window.FirebaseConfig && window.FirebaseConfig.isAuthenticated()) {
        console.log('🚫 Demo mode blocked - user is authenticated');
        return;
    }
    
    // CRITICAL: Don't enter demo mode if auth state hasn't been resolved yet
    // This prevents the race condition where Firebase hasn't confirmed the user yet
    if (window.FirebaseConfig && typeof window.FirebaseConfig.isAuthStateResolved === 'function') {
        if (!window.FirebaseConfig.isAuthStateResolved()) {
            console.log('🚫 Demo mode blocked - auth state not yet resolved');
            return;
        }
    }
    
    isDemoMode = true;
    console.log('🎮 Demo mode activated');
    
    // Close beta modal if it's open - it interferes with the tutorial
    const betaModal = document.getElementById('betaLaunchModal');
    if (betaModal && (betaModal.style.display === 'flex' || betaModal.classList.contains('active'))) {
        console.log('🎮 Closing beta modal for demo mode');
        betaModal.classList.remove('active');
        betaModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Track demo mode start
    if (typeof gtag === 'function') {
        gtag('event', 'demo_mode_start', {
            'event_category': 'engagement',
            'event_label': 'entered_demo'
        });
    }
    
    // Show demo banner
    showDemoBanner();
    
    // Load demo data
    loadDemoData();
}

/**
 * Exit demo mode - called when user signs in
 */
function exitDemoMode() {
    isDemoMode = false;
    
    // Hide demo UI elements
    hideDemoBanner();
    hideDemoSignupCTA();
    closeDemoActionModal();
    
    // Restore original tabs if they were saved
    if (originalTabsHTML) {
        const tabsContainer = document.querySelector('.fund-tabs');
        if (tabsContainer) {
            tabsContainer.innerHTML = originalTabsHTML;
        }
        originalTabsHTML = null; // Reset for next demo session
    }
    
    // Remove ALL demo group cards from grid (shared group + personal colony)
    document.querySelectorAll('.fund-card[data-demo-group]').forEach(card => {
        card.remove();
    });
    
    // Clear ALL demo content from group view containers
    // This is critical - otherwise real groups will show demo data
    const containersToClean = [
        'historyList',      // Expense history
        'historyTab',       // History tab (used by Personal Colony demo)
        'membersTab',       // Members list  
        'balancesTab',      // Balances
        'inviteTab',        // Invite section
        'mascotTab'         // Mascot section
    ];
    
    containersToClean.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '';
        }
    });
    
    // Also clear any demo items by class
    document.querySelectorAll('.demo-item, .demo-expense-card, .demo-member-item').forEach(el => {
        el.remove();
    });
    
    // Remove demo Personal Colony tabs and restore original tabs
    document.querySelectorAll('.fund-tab-btn[data-demo-tab]').forEach(btn => {
        btn.remove();
    });
    
    // Show all original tabs (they were hidden for Personal Colony demo)
    document.querySelectorAll('.fund-tab-btn[data-tab]').forEach(btn => {
        // Don't show blockchain tabs by default
        const tabName = btn.getAttribute('data-tab');
        if (!['deposit', 'propose', 'vote', 'manage'].includes(tabName)) {
            btn.style.display = '';
        }
    });
    
    // If we're viewing the demo group, go back to dashboard
    const fundView = document.getElementById('fundView');
    const fundDetailSection = document.getElementById('fundDetailSection');
    const dashboardSection = document.getElementById('dashboardSection');
    
    // Hide fund detail view
    if (fundDetailSection) {
        fundDetailSection.classList.remove('active');
        fundDetailSection.style.display = 'none';
    }
    if (fundView) {
        fundView.style.display = 'none';
    }
    
    // Show dashboard
    if (dashboardSection) {
        dashboardSection.classList.add('active');
        dashboardSection.style.display = 'block';
    }
    
    // Clear demo data from window
    window.demoGroupData = null;
    window.demoCurrentUser = null;
}

/**
 * Show the demo mode banner at the top
 */
function showDemoBanner() {
    let banner = document.getElementById('demoBanner');
    
    // Get translated text
    const lang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en') || 'en';
    const bannerText = lang === 'es' 
        ? '🎭 Modo Demo - Explora gastos compartidos y finanzas personales'
        : '🎭 Demo Mode - Explore shared expenses & personal finances';
    
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'demoBanner';
        banner.className = 'demo-banner';
        banner.innerHTML = `
            <div class="demo-banner-content">
                <span class="demo-banner-icon">🐜</span>
                <span class="demo-banner-text">${bannerText}</span>
            </div>
        `;
        
        // Insert at the beginning of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(banner, mainContent.firstChild);
        } else {
            // Fallback: try to find dashboard section
            const dashboard = document.getElementById('dashboardSection');
            if (dashboard) {
                dashboard.insertBefore(banner, dashboard.firstChild);
            } else {
                // Last resort: append to body
                document.body.appendChild(banner);
            }
        }
    } else {
        // Update text if banner already exists
        const textSpan = banner.querySelector('.demo-banner-text');
        if (textSpan) {
            textSpan.textContent = bannerText;
        }
    }
    
    banner.style.display = 'flex';
    
    // Apply translations if available
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
}

/**
 * Hide the demo mode banner
 */
function hideDemoBanner() {
    const banner = document.getElementById('demoBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

/**
 * Show the floating CTA to sign up
 */
function showDemoSignupCTA() {
    let cta = document.getElementById('demoSignupCTA');
    
    if (!cta) {
        cta = document.createElement('div');
        cta.id = 'demoSignupCTA';
        cta.className = 'demo-signup-cta';
        
        // Get language-specific text
        const lang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en') || 'en';
        const ctaTexts = {
            en: {
                title: 'Ready to take control?',
                subtitle: 'Track expenses & grow your wealth',
                button: 'Start Free →'
            },
            es: {
                title: '¿Listo para tomar control?',
                subtitle: 'Rastrea gastos y haz crecer tu patrimonio',
                button: 'Empezar Gratis →'
            }
        };
        const t = ctaTexts[lang] || ctaTexts.en;
        
        cta.innerHTML = `
            <div class="demo-cta-content">
                <div class="demo-cta-text">
                    <strong>${t.title}</strong>
                    <span>${t.subtitle}</span>
                </div>
                <button class="btn btn-primary demo-cta-button" onclick="window.promptDemoSignup('floating_cta')">
                    <span>${t.button}</span>
                </button>
            </div>
            <button class="demo-cta-close" onclick="window.minimizeDemoSignupCTA()" title="Minimize">−</button>
        `;
        
        document.body.appendChild(cta);
    }
    
    cta.style.display = 'flex';
    cta.classList.remove('minimized');
    
    // Apply translations if available
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
}

/**
 * Minimize the floating CTA
 */
function minimizeDemoSignupCTA() {
    const cta = document.getElementById('demoSignupCTA');
    if (cta) {
        cta.classList.add('minimized');
    }
}

/**
 * Hide the floating CTA completely
 */
function hideDemoSignupCTA() {
    const cta = document.getElementById('demoSignupCTA');
    if (cta) {
        cta.style.display = 'none';
    }
}

/**
 * Show modal when user tries to perform an action that requires login
 */
function showDemoActionModal(actionType) {
    // Track interaction
    if (typeof gtag === 'function') {
        gtag('event', 'demo_action_blocked', {
            'event_category': 'engagement',
            'event_label': actionType
        });
    }
    
    // Check if this is a personal finance action
    const personalFinanceActions = ['edit_budget', 'add_category', 'edit_asset', 'add_asset', 'edit_goal', 'add_goal'];
    const isPersonalFinance = personalFinanceActions.includes(actionType);
    
    // Get translated strings
    const translations = {
        en: {
            // Group-related
            title: '🐜 Ready to take action?',
            subtitle: 'Sign in to create your own group and start tracking real expenses with your friends.',
            benefit1: '✓ Create unlimited groups',
            benefit2: '✓ Invite friends by email',
            benefit3: '✓ Track expenses in real-time',
            benefit4: '✓ Get smart settlement suggestions',
            // Personal finance-related
            personalTitle: '🐜 Take control of your finances!',
            personalSubtitle: 'Sign in to start tracking your personal budget, investments, and financial goals.',
            personalBenefit1: '✓ Create custom budget categories',
            personalBenefit2: '✓ Track your investment portfolio',
            personalBenefit3: '✓ Set and achieve financial goals',
            personalBenefit4: '✓ Get personalized insights',
            // Common
            button: 'Sign In to Continue',
            later: 'Keep Exploring Demo'
        },
        es: {
            // Group-related
            title: '🐜 ¿Listo para actuar?',
            subtitle: 'Inicia sesión para crear tu propio grupo y empezar a rastrear gastos reales con tus amigos.',
            benefit1: '✓ Crea grupos ilimitados',
            benefit2: '✓ Invita amigos por email',
            benefit3: '✓ Rastrea gastos en tiempo real',
            benefit4: '✓ Obtén sugerencias inteligentes de liquidación',
            // Personal finance-related
            personalTitle: '🐜 ¡Toma control de tus finanzas!',
            personalSubtitle: 'Inicia sesión para rastrear tu presupuesto personal, inversiones y metas financieras.',
            personalBenefit1: '✓ Crea categorías de presupuesto personalizadas',
            personalBenefit2: '✓ Rastrea tu portafolio de inversiones',
            personalBenefit3: '✓ Establece y alcanza metas financieras',
            personalBenefit4: '✓ Obtén insights personalizados',
            // Common
            button: 'Inicia Sesión para Continuar',
            later: 'Seguir Explorando Demo'
        }
    };
    
    const lang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en') || 'en';
    const t = translations[lang] || translations.en;
    
    // Choose appropriate content based on action type
    const modalTitle = isPersonalFinance ? t.personalTitle : t.title;
    const modalSubtitle = isPersonalFinance ? t.personalSubtitle : t.subtitle;
    const benefits = isPersonalFinance 
        ? [t.personalBenefit1, t.personalBenefit2, t.personalBenefit3, t.personalBenefit4]
        : [t.benefit1, t.benefit2, t.benefit3, t.benefit4];
    
    // Create modal
    let modal = document.getElementById('demoActionModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'demoActionModal';
        modal.className = 'modal-overlay';
        // Add inline styles to ensure visibility
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
            backdrop-filter: blur(4px);
        `;
        // Close on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.closeDemoActionModal();
            }
        });
        document.body.appendChild(modal);
    }
    
    // Icon varies by action type
    const icon = isPersonalFinance ? '🏠' : '🐜';
    const buttonGradient = isPersonalFinance 
        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    modal.innerHTML = `
        <div class="demo-action-modal" style="
            position: relative;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            margin: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            text-align: center;
        ">
            <button onclick="window.closeDemoActionModal()" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: rgba(255,255,255,0.1);
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            ">&times;</button>
            
            <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
            <h2 style="color: white; margin-bottom: 0.5rem; font-size: 1.5rem;">${modalTitle}</h2>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 1.5rem; line-height: 1.5;">${modalSubtitle}</p>
            
            <div style="text-align: left; margin-bottom: 1.5rem; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                <div style="color: #4ade80; margin-bottom: 0.5rem;">${benefits[0]}</div>
                <div style="color: #4ade80; margin-bottom: 0.5rem;">${benefits[1]}</div>
                <div style="color: #4ade80; margin-bottom: 0.5rem;">${benefits[2]}</div>
                <div style="color: #4ade80;">${benefits[3]}</div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <button onclick="window.promptDemoSignup('action_modal')" style="
                    background: ${buttonGradient};
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                ">
                    ${t.button}
                </button>
                <button onclick="window.closeDemoActionModal()" style="
                    background: transparent;
                    color: rgba(255,255,255,0.7);
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    cursor: pointer;
                ">
                    ${t.later}
                </button>
            </div>
        </div>
    `;
    
    // Show the modal
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.classList.add('active');
}

/**
 * Close the demo action modal
 */
function closeDemoActionModal() {
    const modal = document.getElementById('demoActionModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        modal.classList.remove('active');
    }
}

/**
 * Prompt user to sign up from demo mode
 */
function promptDemoSignup(source) {
    // Track conversion intent
    if (typeof gtag === 'function') {
        gtag('event', 'demo_to_signup', {
            'event_category': 'conversion',
            'event_label': source
        });
    }
    
    // Close any open modals
    closeDemoActionModal();
    
    // Open sign in modal - showSignInModal is the correct function name
    if (typeof showSignInModal === 'function') {
        showSignInModal();
    } else {
        // Fallback: try to show the modal directly
        const signInModal = document.getElementById('signInModal');
        if (signInModal) {
            signInModal.style.display = 'flex';
        }
    }
}

/**
 * Load demo data into the app
 */
function loadDemoData() {
    console.log('[Demo] loadDemoData() called');
    
    // CRITICAL: Clear real user data to prevent showing real groups
    if (typeof window.clearAllUserGroups === 'function') {
        window.clearAllUserGroups();
    }
    
    // Set global variables that the app expects
    window.demoGroupData = DEMO_GROUP_DATA;
    window.demoCurrentUser = DEMO_CURRENT_USER;
    
    // Ensure dashboard is visible
    const dashboardSection = document.getElementById('dashboardSection');
    const fundDetailSection = document.getElementById('fundDetailSection');
    
    if (fundDetailSection) {
        fundDetailSection.classList.remove('active');
        fundDetailSection.style.display = 'none';
    }
    if (dashboardSection) {
        dashboardSection.classList.add('active');
        dashboardSection.style.display = 'block';
    }
    
    // Mobile nav support: apply mobile-home-view class and handle skeleton/greeting
    if (typeof isMobileNavMode === 'function' && isMobileNavMode()) {
        if (dashboardSection) {
            dashboardSection.classList.add('mobile-home-view');
        }
        // Hide Financial Summary skeleton and show content with demo data
        const skeleton = document.getElementById('financialSummarySkeleton');
        const content = document.getElementById('financialSummaryContent');
        if (skeleton) skeleton.style.display = 'none';
        if (content) content.style.display = 'block';
        // Populate financial summary with demo values
        const totalOwedToYou = document.getElementById('totalOwedToYou');
        const totalYouOwe = document.getElementById('totalYouOwe');
        const owedToYouGroups = document.getElementById('owedToYouGroups');
        const youOweGroups = document.getElementById('youOweGroups');
        const financialDetails = document.getElementById('financialDetails');
        const allSettledMessage = document.getElementById('allSettledMessage');
        if (totalOwedToYou) totalOwedToYou.textContent = '$71.67';
        if (totalYouOwe) totalYouOwe.textContent = '$40.00';
        if (owedToYouGroups) owedToYouGroups.textContent = '1 group';
        if (youOweGroups) youOweGroups.textContent = '1 group';
        if (financialDetails) financialDetails.style.display = 'none';
        if (allSettledMessage) allSettledMessage.style.display = 'none';
        // Update greeting for demo user
        if (typeof updateMobileGreeting === 'function') {
            updateMobileGreeting();
        }
    }
    
    // Show the demo group in the dashboard
    displayDemoGroups();
    
    // Verify demo groups are displayed
    const groupsGrid = document.getElementById('groupsGrid');
    console.log('[Demo] Groups grid HTML length:', groupsGrid ? groupsGrid.innerHTML.length : 0);
    
    // Start the guided tutorial after a short delay (gives time for DOM to render)
    setTimeout(() => {
        // Re-ensure demo groups are visible before tutorial
        const demoCards = document.querySelectorAll('.demo-fund-card');
        console.log('[Demo] Demo cards found before tutorial:', demoCards.length);
        if (demoCards.length === 0) {
            console.log('[Demo] No demo cards found, re-displaying...');
            displayDemoGroups();
        }
        startDemoTutorial();
    }, 500);
    
    // Show the floating CTA after tutorial completes or is skipped
    // (moved to after tutorial completion)
}

/**
 * Display demo groups in the dashboard
 * Shows both shared group AND Personal Colony to showcase all features
 */
function displayDemoGroups() {
    console.log('[Demo] displayDemoGroups() called');
    
    const groupsGrid = document.getElementById('groupsGrid');
    const emptyState = document.getElementById('emptyState');
    const loadingGroups = document.getElementById('loadingGroups');
    
    // Hide loading and empty states
    if (loadingGroups) loadingGroups.style.display = 'none';
    if (emptyState) {
        emptyState.style.display = 'none';
        console.log('[Demo] Empty state hidden');
    }
    
    if (!groupsGrid) {
        console.error('[Demo] groupsGrid not found!');
        return;
    }
    
    // Calculate demo group stats
    const totalExpenses = Object.values(DEMO_GROUP_DATA.expenses)
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const memberCount = Object.keys(DEMO_GROUP_DATA.members).length;
    const expenseCount = Object.keys(DEMO_GROUP_DATA.expenses).length;
    
    // Calculate Personal Colony stats
    const totalBudgetSpent = Object.values(DEMO_PERSONAL_COLONY_DATA.budget)
        .reduce((sum, cat) => sum + cat.spent, 0);
    const totalBudgetLimit = Object.values(DEMO_PERSONAL_COLONY_DATA.budget)
        .reduce((sum, cat) => sum + cat.limit, 0);
    const portfolioValue = Object.values(DEMO_PERSONAL_COLONY_DATA.portfolio)
        .reduce((sum, asset) => sum + asset.value, 0);
    
    // Get translations
    const currentLang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en') || 'en';
    const texts = {
        en: {
            members: 'members',
            totalSpent: 'Total spent',
            tapToExplore: 'Tap to explore →',
            personalTitle: 'Personal Finances',
            budgetUsed: 'Budget used',
            portfolioValue: 'Portfolio',
            goals: 'Goals',
            tapPersonal: 'Explore your finances →',
            new: 'NEW'
        },
        es: {
            members: 'miembros',
            totalSpent: 'Total gastado',
            tapToExplore: 'Toca para explorar →',
            personalTitle: 'Finanzas Personales',
            budgetUsed: 'Presupuesto usado',
            portfolioValue: 'Portafolio',
            goals: 'Metas',
            tapPersonal: 'Explora tus finanzas →',
            new: 'NUEVO'
        }
    };
    const t = texts[currentLang] || texts.en;
    
    // Render BOTH demo cards - Personal Colony FIRST (more important for retention)
    groupsGrid.innerHTML = `
        <!-- Personal Colony Demo Card - Featured prominently -->
        <div class="fund-card demo-fund-card demo-personal-colony-card" data-demo-group="personal" onclick="window.openDemoPersonalColony()">
            <div class="fund-card-content">
                <div class="demo-badge-corner demo-badge-new">${t.new} ✨</div>
                
                <div class="fund-card-header">
                    <div class="fund-icon" style="font-size: 2rem;">🏠</div>
                    <div class="fund-card-title">
                        <h3>${t.personalTitle}</h3>
                        <div class="fund-badges">
                            <span class="badge badge-mode mode-personal" style="background: linear-gradient(135deg, #667eea, #764ba2);">🐜 Personal Colony</span>
                        </div>
                    </div>
                </div>
                
                <div class="fund-stats" style="grid-template-columns: 1fr 1fr;">
                    <div class="fund-stat">
                        <span class="fund-stat-label">📊 ${t.budgetUsed}</span>
                        <span class="fund-stat-value">$${totalBudgetSpent.toFixed(0)}/${totalBudgetLimit.toFixed(0)}</span>
                    </div>
                    <div class="fund-stat">
                        <span class="fund-stat-label">📈 ${t.portfolioValue}</span>
                        <span class="fund-stat-value" style="color: #22c55e;">$${(portfolioValue/1000).toFixed(1)}K</span>
                    </div>
                </div>
                
                <div class="fund-meta">
                    <span>🎯 ${DEMO_PERSONAL_COLONY_DATA.goals.length} ${t.goals}</span>
                    <span>💡 5 ${currentLang === 'es' ? 'Categorías' : 'Categories'}</span>
                </div>
                
                <div class="demo-tap-hint" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-radius: 8px; padding: 0.5rem; margin-top: 0.5rem; border-top: none;">
                    <span style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <span class="demo-walking-ant">🐜</span>
                        ${t.tapPersonal}
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Shared Group Demo Card -->
        <div class="fund-card demo-fund-card" data-demo-group="true" onclick="window.openDemoGroup()">
            <div class="fund-card-content">
                <div class="demo-badge-corner">DEMO</div>
                
                <div class="fund-card-header">
                    <div class="fund-icon">${DEMO_GROUP_DATA.icon}</div>
                    <div class="fund-card-title">
                        <h3>${DEMO_GROUP_DATA.fundName}</h3>
                        <div class="fund-badges">
                            <span class="badge badge-mode mode-simple">🐜 Simple</span>
                        </div>
                    </div>
                </div>
                
                <div class="fund-stats">
                    <div class="fund-stat">
                        <span class="fund-stat-label">${t.totalSpent}</span>
                        <span class="fund-stat-value">$${totalExpenses.toFixed(2)} ${DEMO_GROUP_DATA.currency}</span>
                    </div>
                </div>
                
                <div class="fund-meta">
                    <span>👥 ${memberCount} ${t.members}</span>
                    <span>💰 ${expenseCount} expenses</span>
                </div>
                
                <div class="demo-tap-hint">
                    <span>${t.tapToExplore}</span>
                </div>
            </div>
        </div>
    `;
    
    groupsGrid.style.display = 'grid';
    
    // Update stats display
    const totalGroupsCreated = document.getElementById('totalGroupsCreated');
    const totalGroupsParticipating = document.getElementById('totalGroupsParticipating');
    const totalGroupsJoined = document.getElementById('totalGroupsJoined');
    const countAll = document.getElementById('countAll');
    const countCreated = document.getElementById('countCreated');
    const countParticipating = document.getElementById('countParticipating');
    
    if (totalGroupsCreated) totalGroupsCreated.textContent = '2';
    if (totalGroupsParticipating) totalGroupsParticipating.textContent = '2';
    if (totalGroupsJoined) totalGroupsJoined.textContent = '2';
    if (countAll) countAll.textContent = '2';
    if (countCreated) countCreated.textContent = '2';
    if (countParticipating) countParticipating.textContent = '2';
    
    console.log('[Demo] Demo groups displayed. Cards:', document.querySelectorAll('.demo-fund-card').length);
}

/**
 * Open the demo Personal Colony view
 */
function openDemoPersonalColony() {
    // Track interaction
    if (typeof gtag === 'function') {
        gtag('event', 'demo_interaction', {
            'event_category': 'engagement',
            'event_label': 'open_personal_colony'
        });
    }
    
    // Show fund detail section, hide dashboard
    const dashboardSection = document.getElementById('dashboardSection');
    const fundDetailSection = document.getElementById('fundDetailSection');
    
    if (dashboardSection) {
        dashboardSection.classList.remove('active');
        dashboardSection.style.display = 'none';
    }
    if (fundDetailSection) {
        fundDetailSection.classList.add('active');
        fundDetailSection.style.display = 'block';
    }
    
    // Populate with Personal Colony demo data
    populateDemoPersonalColonyDetail();
}

/**
 * Populate the Personal Colony demo detail view
 */
function populateDemoPersonalColonyDetail() {
    const colony = DEMO_PERSONAL_COLONY_DATA;
    const lang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en') || 'en';
    
    // Text translations
    const t = {
        en: {
            headerTitle: 'Personal Finances',
            headerDesc: 'Track your budget, investments and financial goals',
            budgetTab: 'Budget',
            portfolioTab: 'Portfolio',
            goalsTab: 'Goals',
            thisMonth: 'This Month',
            totalBudget: 'Total Budget',
            remaining: 'Remaining',
            spent: 'Spent',
            ofBudget: 'of budget',
            onTrack: 'On track',
            overBudget: 'Over budget',
            portfolioValue: 'Portfolio Value',
            totalGain: 'Total Gain',
            invested: 'Invested',
            yourGoals: 'Your Goals',
            saved: 'saved',
            deadline: 'Target',
            noDeadline: 'No deadline',
            signInCTA: 'Sign in to track your real finances!',
            signInBudget: 'Sign in to create your budget',
            signInPortfolio: 'Sign in to track your investments',
            signInGoals: 'Sign in to set your goals'
        },
        es: {
            headerTitle: 'Finanzas Personales',
            headerDesc: 'Rastrea tu presupuesto, inversiones y metas financieras',
            budgetTab: 'Presupuesto',
            portfolioTab: 'Portafolio',
            goalsTab: 'Metas',
            thisMonth: 'Este Mes',
            totalBudget: 'Presupuesto Total',
            remaining: 'Restante',
            spent: 'Gastado',
            ofBudget: 'del presupuesto',
            onTrack: 'En línea',
            overBudget: 'Excedido',
            portfolioValue: 'Valor del Portafolio',
            totalGain: 'Ganancia Total',
            invested: 'Invertido',
            yourGoals: 'Tus Metas',
            saved: 'ahorrado',
            deadline: 'Fecha objetivo',
            noDeadline: 'Sin fecha límite',
            signInCTA: '¡Inicia sesión para rastrear tus finanzas reales!',
            signInBudget: 'Inicia sesión para crear tu presupuesto',
            signInPortfolio: 'Inicia sesión para rastrear tus inversiones',
            signInGoals: 'Inicia sesión para establecer tus metas'
        }
    };
    const tr = t[lang] || t.en;
    
    // Header
    const fundDetailName = document.getElementById('fundDetailName');
    const fundDetailDescription = document.getElementById('fundDetailDescription');
    const fundHeaderIcon = document.getElementById('fundHeaderIcon');
    
    if (fundDetailName) fundDetailName.textContent = tr.headerTitle;
    if (fundDetailDescription) fundDetailDescription.textContent = tr.headerDesc;
    if (fundHeaderIcon) fundHeaderIcon.textContent = '🏠';
    
    // Update badges
    const typeBadge = document.getElementById('fundTypeBadge');
    const statusBadge = document.getElementById('fundStatusBadge');
    
    if (typeBadge) typeBadge.textContent = '🐜 Personal Colony';
    if (statusBadge) statusBadge.textContent = '✅ Active';
    
    // Hide ALL standard tabs
    document.querySelectorAll('.fund-tab-btn').forEach(btn => {
        btn.style.display = 'none';
    });
    
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Create custom Personal Colony tabs
    const tabsContainer = document.querySelector('.fund-tabs');
    if (tabsContainer) {
        // IMPORTANT: Save original tabs HTML before replacing (only once)
        if (!originalTabsHTML) {
            originalTabsHTML = tabsContainer.innerHTML;
        }
        
        // Replace with Personal Colony specific tabs
        tabsContainer.innerHTML = `
            <button class="fund-tab-btn active" data-demo-tab="budget" onclick="window.switchDemoPersonalTab('budget')">
                📊 ${tr.budgetTab}
            </button>
            <button class="fund-tab-btn" data-demo-tab="portfolio" onclick="window.switchDemoPersonalTab('portfolio')">
                📈 ${tr.portfolioTab}
            </button>
            <button class="fund-tab-btn" data-demo-tab="goals" onclick="window.switchDemoPersonalTab('goals')">
                🎯 ${tr.goalsTab}
            </button>
        `;
    }
    
    // Use historyTab container for our demo content (it's always present)
    const contentContainer = document.getElementById('historyTab') || document.querySelector('.tab-pane');
    if (contentContainer) {
        contentContainer.classList.add('active');
        contentContainer.id = 'historyTab'; // Ensure it has the ID
    }
    
    // Render Budget tab (default)
    renderDemoBudgetTab(tr);
}

/**
 * Switch between Personal Colony demo tabs
 */
function switchDemoPersonalTab(tabName) {
    const lang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en') || 'en';
    
    const t = {
        en: {
            thisMonth: 'This Month',
            totalBudget: 'Total Budget',
            remaining: 'Remaining',
            spent: 'Spent',
            ofBudget: 'of budget',
            onTrack: 'On track',
            overBudget: 'Over budget',
            portfolioValue: 'Portfolio Value',
            totalGain: 'Total Gain',
            invested: 'Invested',
            yourGoals: 'Your Goals',
            saved: 'saved',
            deadline: 'Target',
            noDeadline: 'No deadline',
            signInCTA: 'Sign in to track your real finances!',
            signInBudget: 'Sign in to create your budget',
            signInPortfolio: 'Sign in to track your investments',
            signInGoals: 'Sign in to set your goals',
            addCategory: 'Add Category',
            addAsset: 'Add Asset',
            addGoal: 'Add Goal'
        },
        es: {
            thisMonth: 'Este Mes',
            totalBudget: 'Presupuesto Total',
            remaining: 'Restante',
            spent: 'Gastado',
            ofBudget: 'del presupuesto',
            onTrack: 'En línea',
            overBudget: 'Excedido',
            portfolioValue: 'Valor del Portafolio',
            totalGain: 'Ganancia Total',
            invested: 'Invertido',
            yourGoals: 'Tus Metas',
            saved: 'ahorrado',
            deadline: 'Fecha objetivo',
            noDeadline: 'Sin fecha límite',
            signInCTA: '¡Inicia sesión para rastrear tus finanzas reales!',
            signInBudget: 'Inicia sesión para crear tu presupuesto',
            signInPortfolio: 'Inicia sesión para rastrear tus inversiones',
            signInGoals: 'Inicia sesión para establecer tus metas',
            addCategory: 'Añadir Categoría',
            addAsset: 'Añadir Activo',
            addGoal: 'Añadir Meta'
        }
    };
    const tr = t[lang] || t.en;
    
    // Update tab button states
    document.querySelectorAll('.fund-tab-btn[data-demo-tab]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-demo-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Render the selected tab
    switch(tabName) {
        case 'budget':
            renderDemoBudgetTab(tr);
            break;
        case 'portfolio':
            renderDemoPortfolioTab(tr);
            break;
        case 'goals':
            renderDemoGoalsTab(tr);
            break;
    }
}

/**
 * Render Budget tab content
 */
function renderDemoBudgetTab(tr) {
    const container = document.getElementById('historyTab');
    if (!container) return;
    
    const budget = DEMO_PERSONAL_COLONY_DATA.budget;
    const totalSpent = Object.values(budget).reduce((sum, cat) => sum + cat.spent, 0);
    const totalLimit = Object.values(budget).reduce((sum, cat) => sum + cat.limit, 0);
    const remaining = totalLimit - totalSpent;
    const percentUsed = (totalSpent / totalLimit * 100).toFixed(0);
    
    let categoriesHtml = '';
    Object.values(budget).forEach(cat => {
        const percent = (cat.spent / cat.limit * 100).toFixed(0);
        const isOver = cat.spent > cat.limit;
        const barColor = isOver ? '#ef4444' : cat.color;
        
        categoriesHtml += `
            <div class="demo-budget-category" style="
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1rem;
                margin-bottom: 0.75rem;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            " onclick="window.showDemoActionModal('edit_budget')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.5rem;">${cat.emoji}</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${cat.name}</span>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-weight: 700; color: ${isOver ? '#ef4444' : 'var(--text-primary)'};">$${cat.spent.toFixed(0)}</span>
                        <span style="color: var(--text-secondary); font-size: 0.9rem;">/ $${cat.limit}</span>
                    </div>
                </div>
                <div style="background: rgba(0,0,0,0.2); border-radius: 6px; height: 8px; overflow: hidden;">
                    <div style="width: ${Math.min(percent, 100)}%; height: 100%; background: ${barColor}; border-radius: 6px; transition: width 0.5s ease;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary);">
                    <span>${percent}% ${tr.ofBudget}</span>
                    <span style="color: ${isOver ? '#ef4444' : '#22c55e'};">${isOver ? tr.overBudget : tr.onTrack}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = `
        <div style="padding: 0.5rem 0;">
            <!-- Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
                <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15)); border: 1px solid rgba(102, 126, 234, 0.2); border-radius: 16px; padding: 1rem; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #667eea;">$${totalLimit.toFixed(0)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${tr.totalBudget}</div>
                </div>
                <div style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(234, 88, 12, 0.15)); border: 1px solid rgba(251, 146, 60, 0.2); border-radius: 16px; padding: 1rem; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #fb923c;">$${totalSpent.toFixed(0)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${tr.spent}</div>
                </div>
                <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15)); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 16px; padding: 1rem; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #22c55e;">$${remaining.toFixed(0)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${tr.remaining}</div>
                </div>
            </div>
            
            <!-- Progress Ring -->
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="position: relative; width: 120px; height: 120px; margin: 0 auto;">
                    <svg viewBox="0 0 36 36" style="transform: rotate(-90deg);">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(102,126,234,0.2)" stroke-width="3"/>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#gradient)" stroke-width="3" stroke-dasharray="${percentUsed}, 100" stroke-linecap="round"/>
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#667eea"/>
                                <stop offset="100%" style="stop-color:#764ba2"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">${percentUsed}%</div>
                        <div style="font-size: 0.7rem; color: var(--text-secondary);">${tr.ofBudget}</div>
                    </div>
                </div>
            </div>
            
            <!-- Categories -->
            <h4 style="margin: 0 0 1rem 0; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center;">
                <span>📊 ${tr.thisMonth}</span>
                <button onclick="window.showDemoActionModal('add_category')" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8rem; cursor: pointer;">
                    + ${tr.addCategory || 'Add'}
                </button>
            </h4>
            ${categoriesHtml}
            
            <!-- CTA -->
            <div style="text-align: center; padding: 1.5rem; margin-top: 1rem; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-radius: 16px; border: 1px solid rgba(102, 126, 234, 0.2);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🐜📊</div>
                <button onclick="window.promptDemoSignup('budget_cta')" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    ${tr.signInBudget}
                </button>
            </div>
        </div>
    `;
}

/**
 * Render Portfolio tab content
 */
function renderDemoPortfolioTab(tr) {
    const container = document.getElementById('historyTab');
    if (!container) return;
    
    const portfolio = DEMO_PERSONAL_COLONY_DATA.portfolio;
    const totalValue = Object.values(portfolio).reduce((sum, a) => sum + a.value, 0);
    const totalInvested = Object.values(portfolio).reduce((sum, a) => sum + a.invested, 0);
    const totalGain = totalValue - totalInvested;
    const totalGainPercent = ((totalGain / totalInvested) * 100).toFixed(1);
    
    let assetsHtml = '';
    Object.values(portfolio).forEach(asset => {
        const isPositive = asset.change >= 0;
        
        assetsHtml += `
            <div style="
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1rem;
                margin-bottom: 0.75rem;
                cursor: pointer;
                transition: transform 0.2s;
            " onclick="window.showDemoActionModal('edit_asset')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 2rem;">${asset.emoji}</span>
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${asset.name}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${tr.invested}: $${asset.invested.toLocaleString()}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">$${asset.value.toLocaleString()}</div>
                        <div style="font-size: 0.85rem; color: ${isPositive ? '#22c55e' : '#ef4444'};">
                            ${isPositive ? '↑' : '↓'} ${isPositive ? '+' : ''}${asset.changePercent.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = `
        <div style="padding: 0.5rem 0;">
            <!-- Portfolio Summary -->
            <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.15)); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: center;">
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${tr.portfolioValue}</div>
                <div style="font-size: 2.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">$${totalValue.toLocaleString()}</div>
                <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: ${totalGain >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; border-radius: 20px;">
                    <span style="color: ${totalGain >= 0 ? '#22c55e' : '#ef4444'}; font-weight: 600;">
                        ${totalGain >= 0 ? '↑' : '↓'} $${Math.abs(totalGain).toLocaleString()} (${totalGain >= 0 ? '+' : ''}${totalGainPercent}%)
                    </span>
                </div>
            </div>
            
            <!-- Investment Stats -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
                <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; text-align: center;">
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">$${totalInvested.toLocaleString()}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${tr.invested}</div>
                </div>
                <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; text-align: center;">
                    <div style="font-size: 1.25rem; font-weight: 700; color: #22c55e;">+$${totalGain.toLocaleString()}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${tr.totalGain}</div>
                </div>
            </div>
            
            <!-- Assets List -->
            <h4 style="margin: 0 0 1rem 0; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center;">
                <span>📈 Assets</span>
                <button onclick="window.showDemoActionModal('add_asset')" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8rem; cursor: pointer;">
                    + ${tr.addAsset || 'Add'}
                </button>
            </h4>
            ${assetsHtml}
            
            <!-- CTA -->
            <div style="text-align: center; padding: 1.5rem; margin-top: 1rem; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1)); border-radius: 16px; border: 1px solid rgba(34, 197, 94, 0.2);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🐜📈</div>
                <button onclick="window.promptDemoSignup('portfolio_cta')" style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);">
                    ${tr.signInPortfolio}
                </button>
            </div>
        </div>
    `;
}

/**
 * Render Goals tab content
 */
function renderDemoGoalsTab(tr) {
    const container = document.getElementById('historyTab');
    if (!container) return;
    
    const goals = DEMO_PERSONAL_COLONY_DATA.goals;
    const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
    
    let goalsHtml = '';
    goals.forEach(goal => {
        const percent = (goal.saved / goal.target * 100).toFixed(0);
        const remaining = goal.target - goal.saved;
        const deadlineStr = goal.deadline 
            ? new Date(goal.deadline).toLocaleDateString()
            : tr.noDeadline;
        
        goalsHtml += `
            <div style="
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 16px;
                padding: 1.25rem;
                margin-bottom: 1rem;
                cursor: pointer;
                transition: transform 0.2s;
            " onclick="window.showDemoActionModal('edit_goal')">
                <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
                    <div style="font-size: 2.5rem;">${goal.emoji}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.25rem;">${goal.name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">
                            🎯 ${tr.deadline}: ${deadlineStr}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #667eea;">${percent}%</div>
                    </div>
                </div>
                
                <div style="background: rgba(0,0,0,0.2); border-radius: 8px; height: 12px; overflow: hidden; margin-bottom: 0.75rem;">
                    <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 8px; transition: width 0.5s;"></div>
                </div>
                
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                    <span style="color: #22c55e; font-weight: 600;">$${goal.saved.toLocaleString()} ${tr.saved}</span>
                    <span style="color: var(--text-secondary);">$${remaining.toLocaleString()} ${tr.remaining || 'remaining'}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = `
        <div style="padding: 0.5rem 0;">
            <!-- Goals Summary -->
            <div style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(234, 88, 12, 0.15)); border: 1px solid rgba(251, 146, 60, 0.2); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎯</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${tr.yourGoals}</div>
                <div style="font-size: 2rem; font-weight: 700; color: var(--text-primary);">
                    ${goals.length} ${goals.length === 1 ? 'Goal' : 'Goals'}
                </div>
                <div style="font-size: 1rem; color: #22c55e; margin-top: 0.5rem;">
                    $${totalSaved.toLocaleString()} / $${totalTarget.toLocaleString()} ${tr.saved}
                </div>
            </div>
            
            <!-- Goals List -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="margin: 0; color: var(--text-primary);">🎯 ${tr.yourGoals}</h4>
                <button onclick="window.showDemoActionModal('add_goal')" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8rem; cursor: pointer;">
                    + ${tr.addGoal || 'Add Goal'}
                </button>
            </div>
            ${goalsHtml}
            
            <!-- CTA -->
            <div style="text-align: center; padding: 1.5rem; margin-top: 1rem; background: linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(234, 88, 12, 0.1)); border-radius: 16px; border: 1px solid rgba(251, 146, 60, 0.2);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🐜🎯</div>
                <button onclick="window.promptDemoSignup('goals_cta')" style="background: linear-gradient(135deg, #fb923c, #ea580c); color: white; border: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(251, 146, 60, 0.4);">
                    ${tr.signInGoals}
                </button>
            </div>
        </div>
    `;
}

/**
 * Open the demo group detail view
 */
function openDemoGroup() {
    // Track interaction
    if (typeof gtag === 'function') {
        gtag('event', 'demo_interaction', {
            'event_category': 'engagement',
            'event_label': 'open_group'
        });
    }
    
    // Show fund detail section, hide dashboard
    const dashboardSection = document.getElementById('dashboardSection');
    const fundDetailSection = document.getElementById('fundDetailSection');
    
    if (dashboardSection) {
        dashboardSection.classList.remove('active');
        dashboardSection.style.display = 'none'; // Force hide (override inline styles)
    }
    if (fundDetailSection) {
        fundDetailSection.classList.add('active');
        fundDetailSection.style.display = 'block'; // Force display
    }
    
    // Populate with demo data
    populateDemoGroupDetail();
}

/**
 * Populate the group detail view with demo data
 */
function populateDemoGroupDetail() {
    const group = DEMO_GROUP_DATA;
    
    // ========== RESTORE ORIGINAL TABS IF NEEDED ==========
    // This is critical when switching from Personal Colony view back to shared group
    const tabsContainer = document.querySelector('.fund-tabs');
    if (tabsContainer && originalTabsHTML) {
        tabsContainer.innerHTML = originalTabsHTML;
        console.log('🔄 Restored original tabs for shared group view');
    }
    
    // Header
    const fundDetailName = document.getElementById('fundDetailName');
    const fundDetailDescription = document.getElementById('fundDetailDescription');
    const fundHeaderIcon = document.getElementById('fundHeaderIcon');
    
    if (fundDetailName) fundDetailName.textContent = group.fundName;
    if (fundDetailDescription) fundDetailDescription.textContent = group.description;
    if (fundHeaderIcon) fundHeaderIcon.textContent = group.icon;
    
    // ========== CONFIGURE TABS FOR SIMPLE MODE ==========
    // Hide blockchain-only tabs
    const depositTab = document.querySelector('.fund-tab-btn[data-tab="deposit"]');
    const proposeTab = document.querySelector('.fund-tab-btn[data-tab="propose"]');
    const voteTab = document.querySelector('.fund-tab-btn[data-tab="vote"]');
    const manageTab = document.querySelector('.fund-tab-btn[data-tab="manage"]');
    
    // Hide Personal Colony tabs (not for shared groups)
    const budgetTab = document.querySelector('.fund-tab-btn[data-tab="budget"]');
    const portfolioTab = document.querySelector('.fund-tab-btn[data-tab="portfolio"]');
    
    if (depositTab) depositTab.style.display = 'none';
    if (proposeTab) proposeTab.style.display = 'none';
    if (voteTab) voteTab.style.display = 'none';
    if (manageTab) manageTab.style.display = 'none';
    if (budgetTab) budgetTab.style.display = 'none';
    if (portfolioTab) portfolioTab.style.display = 'none';
    
    // Show Simple Mode tabs (shared group view)
    const overviewTab = document.querySelector('.fund-tab-btn[data-tab="overview"]');
    const inviteTab = document.querySelector('.fund-tab-btn[data-tab="invite"]');
    const historyTab = document.querySelector('.fund-tab-btn[data-tab="history"]');
    const balancesTab = document.querySelector('.fund-tab-btn[data-tab="balances"]');
    const membersTab = document.querySelector('.fund-tab-btn[data-tab="members"]');
    const mascotTab = document.querySelector('.fund-tab-btn[data-tab="mascot"]');
    
    if (overviewTab) overviewTab.style.display = 'flex';
    if (inviteTab) inviteTab.style.display = 'flex';
    if (historyTab) historyTab.style.display = 'flex';
    if (balancesTab) balancesTab.style.display = 'flex';
    if (membersTab) membersTab.style.display = 'flex';
    if (mascotTab) mascotTab.style.display = 'flex';
    
    // Set overview tab as active by default
    document.querySelectorAll('.fund-tab-btn').forEach(btn => btn.classList.remove('active'));
    if (overviewTab) overviewTab.classList.add('active');
    
    // Show overview tab content, hide others
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    const overviewPane = document.getElementById('overviewTab');
    if (overviewPane) overviewPane.classList.add('active');
    
    // Update badges for Simple Mode
    const typeBadge = document.getElementById('fundTypeBadge');
    const statusBadge = document.getElementById('fundStatusBadge');
    const privacyBadge = document.getElementById('fundPrivacyBadge');
    
    if (typeBadge) typeBadge.textContent = '🐜 Simple Mode';
    if (statusBadge) statusBadge.textContent = '✅ Active';
    if (privacyBadge) privacyBadge.textContent = '🌍 Public';
    
    // ========== END TAB CONFIGURATION ==========
    
    // Calculate balances
    const totalExpenses = Object.values(group.expenses)
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + e.amount, 0);
    
    // Update balance displays
    const fundBalanceMain = document.getElementById('fundBalanceMain');
    if (fundBalanceMain) fundBalanceMain.textContent = `$${totalExpenses.toFixed(2)}`;
    
    // Update member count and expense count
    const fundMembers = document.getElementById('fundMembers');
    const fundProposals = document.getElementById('fundProposals');
    
    if (fundMembers) fundMembers.textContent = Object.keys(group.members).length.toString();
    if (fundProposals) fundProposals.textContent = Object.keys(group.expenses).length.toString();
    
    // Calculate user's simulated balance
    const myBalance = calculateDemoBalance();
    const userContribution = document.getElementById('userContribution');
    if (userContribution) {
        userContribution.textContent = myBalance >= 0 
            ? `You are owed $${Math.abs(myBalance).toFixed(2)}`
            : `You owe $${Math.abs(myBalance).toFixed(2)}`;
    }
    
    // Render expenses in timeline
    renderDemoTimeline();
    
    // Render members
    renderDemoMembers();
    
    // Render balances
    renderDemoBalances();
    
    // Show demo-specific UI
    showDemoGroupUI();
}

/**
 * Calculate demo user's simulated balance
 */
function calculateDemoBalance() {
    const group = DEMO_GROUP_DATA;
    const demoUserId = 'demo-user-carlos'; // Simulate as Carlos
    const members = Object.keys(group.members);
    let balance = 0;
    
    for (const expense of Object.values(group.expenses)) {
        const participantCount = expense.participants.length;
        const shareAmount = expense.amount / participantCount;
        
        // If demo user paid
        if (expense.paidBy.includes(demoUserId)) {
            balance += expense.amount - shareAmount; // Others owe me
        } else if (expense.participants.includes(demoUserId)) {
            balance -= shareAmount; // I owe payer
        }
    }
    
    return balance;
}

/**
 * Render demo balances tab - matches the real app's balance display
 */
function renderDemoBalances() {
    const balancesContainer = document.getElementById('balancesTab') || 
                              document.querySelector('.balances-list');
    
    if (!balancesContainer) return;
    
    const group = DEMO_GROUP_DATA;
    const members = Object.entries(group.members);
    const demoUserId = 'demo-user-carlos'; // Current demo user (Carlos)
    
    // Calculate each member's balance
    const balances = {};
    for (const [id, member] of members) {
        balances[id] = { id, name: member.name, balance: 0, paid: 0, share: 0 };
    }
    
    for (const expense of Object.values(group.expenses)) {
        const shareAmount = expense.amount / expense.participants.length;
        
        // Payer gets credit
        for (const payerId of expense.paidBy) {
            if (balances[payerId]) {
                const payerAmount = expense.paidByAmounts?.[payerId] || expense.amount;
                balances[payerId].balance += payerAmount;
                balances[payerId].paid += payerAmount;
            }
        }
        
        // Participants owe their share
        for (const participantId of expense.participants) {
            if (balances[participantId]) {
                balances[participantId].balance -= shareAmount;
                balances[participantId].share += shareAmount;
            }
        }
    }
    
    // Calculate totals
    const totalExpenses = Object.values(group.expenses)
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + e.amount, 0);
    const perPerson = totalExpenses / members.length;
    
    // Get current language
    const lang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en') || 'en';
    const t = {
        en: {
            title: '⚖️ Smart Balance Tracking',
            subtitle: 'See exactly who owes whom - no more awkward calculations!',
            totalSpent: 'Total Spent',
            perPerson: 'Per Person', 
            members: 'Members',
            youPaid: 'You paid',
            yourShare: 'Your share',
            yourBalance: 'Your balance',
            youGet: 'You get back',
            youOwe: 'You owe',
            smartSettlements: '✨ Smart Settlements',
            settlementsDesc: 'One-click to settle all debts with minimum payments',
            settleNow: 'Settle Up Now',
            memberBreakdown: '📊 Member Breakdown',
            paid: 'Paid',
            share: 'Share', 
            balance: 'Balance',
            signInCTA: '🚀 Sign in to track your real expenses!'
        },
        es: {
            title: '⚖️ Seguimiento Inteligente de Balances',
            subtitle: '¡Mira exactamente quién debe a quién - sin cálculos incómodos!',
            totalSpent: 'Total Gastado',
            perPerson: 'Por Persona',
            members: 'Miembros',
            youPaid: 'Pagaste',
            yourShare: 'Tu parte',
            yourBalance: 'Tu balance',
            youGet: 'Te deben',
            youOwe: 'Debes',
            smartSettlements: '✨ Liquidaciones Inteligentes',
            settlementsDesc: 'Un clic para liquidar todas las deudas con pagos mínimos',
            settleNow: 'Liquidar Ahora',
            memberBreakdown: '📊 Desglose por Miembro',
            paid: 'Pagó',
            share: 'Parte',
            balance: 'Balance',
            signInCTA: '🚀 ¡Inicia sesión para rastrear tus gastos reales!'
        }
    };
    const tr = t[lang] || t.en;
    
    // Carlos's balance
    const myBalance = balances[demoUserId];
    const myBalanceAmount = myBalance?.balance || 0;
    const myPaid = myBalance?.paid || 0;
    const myShare = myBalance?.share || 0;
    
    let html = `
        <!-- Hero Section -->
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${tr.title}</h3>
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">${tr.subtitle}</p>
        </div>
        
        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
            <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%); border-radius: 16px; padding: 1rem; text-align: center; border: 1px solid rgba(102, 126, 234, 0.2);">
                <div style="font-size: 1.5rem; font-weight: 700; color: #667eea;">$${totalExpenses.toFixed(0)}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${tr.totalSpent}</div>
            </div>
            <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%); border-radius: 16px; padding: 1rem; text-align: center; border: 1px solid rgba(34, 197, 94, 0.2);">
                <div style="font-size: 1.5rem; font-weight: 700; color: #22c55e;">$${perPerson.toFixed(0)}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${tr.perPerson}</div>
            </div>
            <div style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%); border-radius: 16px; padding: 1rem; text-align: center; border: 1px solid rgba(251, 146, 60, 0.2);">
                <div style="font-size: 1.5rem; font-weight: 700; color: #fb923c;">${members.length}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${tr.members}</div>
            </div>
        </div>
        
        <!-- Your Balance Card - Theme aware -->
        <div class="demo-balance-card" style="background: var(--glass-bg); backdrop-filter: blur(20px); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid var(--glass-border); box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; font-weight: 600;">C</div>
                <div>
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1rem;">Carlos (${lang === 'es' ? 'Tú' : 'You'})</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">carlos@example.com</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
                <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 0.75rem; text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${tr.youPaid}</div>
                    <div style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">$${myPaid.toFixed(0)}</div>
                </div>
                <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 0.75rem; text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${tr.yourShare}</div>
                    <div style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">$${myShare.toFixed(0)}</div>
                </div>
                <div style="background: ${myBalanceAmount >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border: 1px solid ${myBalanceAmount >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; border-radius: 12px; padding: 0.75rem; text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${tr.yourBalance}</div>
                    <div style="font-size: 1rem; font-weight: 700; color: ${myBalanceAmount >= 0 ? '#22c55e' : '#ef4444'};">${myBalanceAmount >= 0 ? '+' : ''}$${myBalanceAmount.toFixed(2)}</div>
                </div>
            </div>
            
            <div style="text-align: center; padding: 0.75rem; background: ${myBalanceAmount >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border-radius: 12px; border: 1px solid ${myBalanceAmount >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};">
                <span style="font-size: 1.25rem;">${myBalanceAmount >= 0 ? '💚' : '🔴'}</span>
                <span style="color: ${myBalanceAmount >= 0 ? '#22c55e' : '#ef4444'}; font-weight: 600; margin-left: 0.5rem;">
                    ${myBalanceAmount >= 0 ? tr.youGet : tr.youOwe} $${Math.abs(myBalanceAmount).toFixed(2)}
                </span>
            </div>
        </div>
        
        <!-- Smart Settlements Feature -->
        <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: flex-start; gap: 1rem;">
                <div style="font-size: 2rem;">💡</div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #fbbf24; font-size: 1rem;">${tr.smartSettlements}</h4>
                    <p style="margin: 0 0 1rem 0; color: var(--text-secondary); font-size: 0.85rem;">${tr.settlementsDesc}</p>
                    <button onclick="window.showDemoActionModal('smart_settlements')" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                        <span>⚡</span> ${tr.settleNow}
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Member Breakdown -->
        <h4 style="margin: 0 0 1rem 0; color: var(--text-primary);">${tr.memberBreakdown}</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
    `;
    
    // Show all members with their balances
    Object.values(balances).forEach(member => {
        const isCurrentUser = member.id === demoUserId;
        const balanceColor = member.balance >= 0 ? '#22c55e' : '#ef4444';
        const balanceIcon = member.balance >= 0 ? '↑' : '↓';
        
        html += `
            <div style="background: ${isCurrentUser ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))' : 'var(--glass-bg)'}; border: 1px solid ${isCurrentUser ? 'rgba(102, 126, 234, 0.3)' : 'var(--glass-border)'}; border-radius: 12px; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, ${isCurrentUser ? '#667eea, #764ba2' : '#6b7280, #9ca3af'}); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">${member.name.charAt(0)}</div>
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${member.name} ${isCurrentUser ? '(You)' : ''}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${tr.paid} $${member.paid.toFixed(0)} · ${tr.share} $${member.share.toFixed(0)}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.1rem; font-weight: 700; color: ${balanceColor};">
                        ${balanceIcon} $${Math.abs(member.balance).toFixed(2)}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${tr.balance}</div>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        
        <!-- CTA -->
        <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-radius: 16px; border: 1px solid rgba(102, 126, 234, 0.2);">
            <button onclick="window.promptDemoSignup('balances_cta')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                ${tr.signInCTA}
            </button>
        </div>
    `;
    
    balancesContainer.innerHTML = html;
}

/**
 * Render the demo timeline with expenses
 * Uses the same format as renderExpenseItem() in app-platform.js
 */
function renderDemoTimeline() {
    // Use historyList which is the correct container in app.html historyTab
    const timelineContainer = document.getElementById('historyList') ||
                              document.getElementById('timelineContainer') || 
                              document.getElementById('expensesList') ||
                              document.querySelector('.timeline-list');
    
    if (!timelineContainer) return;
    
    const expenses = Object.values(DEMO_GROUP_DATA.expenses)
        .sort((a, b) => b.createdAt - a.createdAt);
    
    let html = '';
    
    for (const expense of expenses) {
        const paidByName = DEMO_GROUP_DATA.members[expense.paidBy[0]]?.name || 'Unknown';
        const dateStr = new Date(expense.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const currency = expense.currency || 'USD';
        const currencySymbol = currency === 'USD' ? '$' : currency;
        const participantCount = expense.participants.length;
        
        // Use the exact same format as renderExpenseItem()
        html += `
            <div class="expense-card-compact demo-item" data-expense-id="${expense.id}" onclick="window.showDemoActionModal('view_expense')">
                <div class="expense-header">
                    <div class="expense-header-left">
                        <h4 class="expense-title-compact">${expense.description}</h4>
                        <span class="expense-date-compact">📅 ${dateStr}</span>
                    </div>
                    <div class="expense-header-right">
                        <div class="expense-amount-large">
                            ${currencySymbol}${expense.amount.toFixed(2)}
                            <span class="currency-label">${currency}</span>
                        </div>
                    </div>
                </div>
                
                <div class="expense-details" style="display: block;">
                    <div class="expense-meta">
                        <span class="meta-item">👤 ${paidByName}</span>
                        <span class="meta-item">👥 ${participantCount} ${participantCount === 1 ? 'person' : 'people'}</span>
                    </div>
                    
                    <div class="expense-interactions">
                        <button class="interaction-btn" onclick="event.stopPropagation(); window.showDemoActionModal('like_expense')" title="Like">
                            🤍
                        </button>
                        <button class="interaction-btn" onclick="event.stopPropagation(); window.showDemoActionModal('comment_expense')" title="Comments">
                            💬
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    timelineContainer.innerHTML = html || '<p class="empty-timeline">No expenses yet</p>';
}

/**
 * Render demo members list
 */
function renderDemoMembers() {
    const membersContainer = document.getElementById('membersList') || 
                             document.querySelector('.members-list');
    
    if (!membersContainer) return;
    
    const members = Object.entries(DEMO_GROUP_DATA.members);
    
    let html = '';
    
    for (const [id, member] of members) {
        const roleIcon = member.role === 'creator' ? '👑' : '👤';
        
        html += `
            <div class="member-item demo-item">
                <div class="member-avatar">${member.name.charAt(0)}</div>
                <div class="member-info">
                    <span class="member-name">${member.name} ${roleIcon}</span>
                    <span class="member-email">${member.email}</span>
                </div>
            </div>
        `;
    }
    
    membersContainer.innerHTML = html;
}

/**
 * Show demo-specific UI elements in group detail
 */
function showDemoGroupUI() {
    // Show the Add Expense FAB button
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    if (addExpenseBtn) {
        addExpenseBtn.style.display = 'flex';
        addExpenseBtn.onclick = () => showDemoActionModal('add_expense');
    }
    
    // Show the Add Expense Card in historyTab
    const addExpenseCard = document.getElementById('simpleAddExpenseCard');
    if (addExpenseCard) {
        addExpenseCard.style.display = 'block';
        const cardBtn = document.getElementById('addExpenseCardBtn');
        if (cardBtn) {
            cardBtn.onclick = () => showDemoActionModal('add_expense');
        }
    }
    
    // Override any existing invite/settle buttons (if they exist)
    const inviteMemberBtn = document.getElementById('inviteMemberBtn');
    const settleUpBtn = document.getElementById('settleUpBtn');
    
    if (inviteMemberBtn) {
        inviteMemberBtn.onclick = () => showDemoActionModal('invite_member');
    }
    
    if (settleUpBtn) {
        settleUpBtn.onclick = () => showDemoActionModal('settle_up');
    }
    
    // For Invite tab: show demo message inside the tab content instead of blocking click
    const inviteTab = document.getElementById('inviteTab');
    if (inviteTab) {
        inviteTab.innerHTML = `
            <div class="demo-invite-placeholder" style="padding: 2rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎫</div>
                <h3 style="margin-bottom: 0.5rem;">Invite Members</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    In a real group, you can invite friends via email or share an invite link.
                </p>
                <button class="btn btn-primary" onclick="window.showDemoActionModal('invite_member')">
                    🔓 Sign In to Invite
                </button>
            </div>
        `;
    }
    
    // For Mascot tab: show demo message
    const mascotTab = document.getElementById('mascotTab');
    if (mascotTab) {
        mascotTab.innerHTML = `
            <div class="demo-mascot-placeholder" style="padding: 2rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🐜</div>
                <h3 style="margin-bottom: 0.5rem;">Colony Mascot</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Your group gets a unique ant mascot that grows as you add expenses!
                </p>
                <button class="btn btn-primary" onclick="window.showDemoActionModal('view_mascot')">
                    🔓 Sign In to Meet Your Ant
                </button>
            </div>
        `;
    }
    
    // ========== OVERRIDE TAB BUTTON CLICKS FOR DEMO MODE ==========
    // This prevents the real app from trying to load Firebase/blockchain data
    
    const tabButtons = document.querySelectorAll('.fund-tab-btn');
    tabButtons.forEach(btn => {
        const tabName = btn.getAttribute('data-tab');
        
        // Clone and replace to remove existing event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Update active states
            document.querySelectorAll('.fund-tab-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
            
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            const targetPane = document.getElementById(tabName + 'Tab');
            if (targetPane) targetPane.classList.add('active');
            
            // Render demo content based on tab
            switch(tabName) {
                case 'history':
                    renderDemoTimeline();
                    break;
                case 'balances':
                    renderDemoBalances();
                    break;
                case 'members':
                    renderDemoMembers();
                    break;
                case 'invite':
                    // Already rendered placeholder
                    break;
                case 'mascot':
                    // Already rendered placeholder
                    break;
            }
        });
    });
}

/**
 * Helper: Get human-readable time ago string
 */
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

// ============================================
// STYLES FOR DEMO MODE (injected dynamically)
// ============================================
function injectDemoStyles() {
    if (document.getElementById('demoModeStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'demoModeStyles';
    styles.textContent = `
        /* Demo Banner */
        .demo-banner {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 1rem;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
            z-index: 100;
            margin: -1rem -1rem 1rem -1rem;
            width: calc(100% + 2rem);
        }
        
        .demo-banner-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .demo-banner-icon {
            font-size: 1.25rem;
        }
        
        /* Demo Floating CTA */
        .demo-signup-cta {
            position: fixed;
            bottom: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg, rgba(255, 255, 255, 0.95));
            border: 1px solid var(--glass-border, rgba(0, 0, 0, 0.1));
            border-radius: 16px;
            padding: 1rem 1.25rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 90%;
            width: auto;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
            from {
                transform: translate(-50%, 100%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
        
        .demo-signup-cta.minimized {
            padding: 0.5rem 1rem;
        }
        
        .demo-signup-cta.minimized .demo-cta-text,
        .demo-signup-cta.minimized .demo-cta-close {
            display: none;
        }
        
        .demo-cta-content {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .demo-cta-text {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
        }
        
        .demo-cta-text strong {
            color: var(--text-primary);
            font-size: 0.95rem;
        }
        
        .demo-cta-text span {
            color: var(--text-secondary);
            font-size: 0.8rem;
        }
        
        .demo-cta-button {
            white-space: nowrap;
            padding: 0.625rem 1rem !important;
            font-size: 0.9rem !important;
        }
        
        .demo-cta-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 1.25rem;
            padding: 0.25rem;
            line-height: 1;
            opacity: 0.6;
            transition: opacity 0.2s;
        }
        
        .demo-cta-close:hover {
            opacity: 1;
        }
        
        /* Demo Fund Card - matches fund-card styles */
        .demo-fund-card {
            position: relative;
            border: 2px dashed var(--primary, #667eea) !important;
        }
        
        .demo-fund-card .fund-card-content {
            position: relative;
        }
        
        .demo-badge-corner {
            position: absolute;
            top: -2px;
            right: -2px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 0.25rem 0.75rem;
            border-radius: 0 12px 0 8px;
            letter-spacing: 0.5px;
            z-index: 10;
        }
        
        .demo-tap-hint {
            text-align: center;
            padding-top: 0.75rem;
            margin-top: 0.75rem;
            border-top: 1px solid var(--border-color, rgba(0,0,0,0.1));
        }
        
        .demo-tap-hint span {
            color: var(--primary, #667eea);
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        /* Personal Colony Demo Card */
        .demo-personal-colony-card {
            border: 2px solid rgba(102, 126, 234, 0.4) !important;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%) !important;
            position: relative;
            overflow: hidden;
        }
        
        .demo-personal-colony-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            background-size: 200% 100%;
            animation: shimmer 2s linear infinite;
        }
        
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        .demo-badge-new {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
        }
        
        .demo-walking-ant {
            display: inline-block;
            animation: walkAnt 1s ease-in-out infinite;
        }
        
        @keyframes walkAnt {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(3px) rotate(5deg); }
            75% { transform: translateX(-3px) rotate(-5deg); }
        }
        
        /* Demo Budget Category Hover */
        .demo-budget-category:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        /* Demo Action Modal */
        .demo-action-modal {
            max-width: 420px;
            text-align: center;
            padding: 2rem;
        }
        
        .demo-modal-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }
        
        .demo-modal-icon {
            font-size: 4rem;
            animation: bounce 1s ease infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .demo-modal-title {
            font-size: 1.5rem;
            color: var(--text-primary);
            margin: 0;
        }
        
        .demo-modal-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.5;
            margin: 0;
        }
        
        .demo-modal-benefits {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            text-align: left;
            width: 100%;
            padding: 1rem;
            background: var(--bg-secondary, #f5f5f5);
            border-radius: 12px;
            margin: 0.5rem 0;
        }
        
        .demo-benefit {
            color: var(--text-primary);
            font-size: 0.9rem;
        }
        
        .demo-modal-actions {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            width: 100%;
            margin-top: 0.5rem;
        }
        
        .demo-modal-actions .btn-large {
            padding: 1rem 2rem;
            font-size: 1.1rem;
        }
        
        /* Demo items in timeline */
        .demo-item {
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .demo-item:hover {
            transform: translateX(4px);
        }
        
        /* Mobile adjustments */
        @media (max-width: 600px) {
            .demo-signup-cta {
                bottom: 1rem;
                padding: 0.875rem 1rem;
                flex-direction: column;
                width: calc(100% - 2rem);
                max-width: none;
            }
            
            .demo-cta-content {
                flex-direction: column;
                text-align: center;
            }
            
            .demo-cta-close {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
            }
            
            .demo-action-modal {
                margin: 1rem;
                padding: 1.5rem;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

// Inject styles on load
injectDemoStyles();

// ============================================
// GUIDED TUTORIAL SYSTEM (Spotlight)
// ============================================

// Tutorial state
let tutorialActive = false;
let tutorialStep = 0;

// Tutorial steps configuration
const TUTORIAL_STEPS = [
    {
        id: 'welcome',
        target: null, // Full screen welcome
        position: 'center'
    },
    {
        id: 'personal-finances',
        target: '.demo-personal-colony-card',
        position: 'auto' // Will calculate best position
    },
    {
        id: 'shared-group',
        target: '.fund-card[data-demo-group="true"]',
        position: 'auto' // Will calculate best position
    },
    {
        id: 'final',
        target: null, // Full screen CTA
        position: 'center'
    }
];

// Tutorial translations
const TUTORIAL_TRANSLATIONS = {
    en: {
        steps: [
            {
                title: '👋 Welcome to Ant Pool!',
                subtitle: 'Your personal finance companion',
                description: 'In just 30 seconds, discover how our ants help you take control of your money.',
                buttonText: 'Start Tour →'
            },
            {
                title: '🏠 Your Personal Colony',
                subtitle: 'Track YOUR finances',
                description: 'Create budgets, track investments, and set savings goals. All in one place, just for you.',
                features: [
                    '📊 Smart budget tracking',
                    '📈 Investment portfolio',
                    '🎯 Financial goals'
                ],
                buttonText: 'Next →'
            },
            {
                title: '👥 Shared Groups',
                subtitle: 'Split expenses easily',
                description: 'Create groups with roommates, friends, or travel buddies. No more awkward "who owes who" conversations.',
                features: [
                    '💸 Auto-calculate splits',
                    '⚖️ Smart settlements',
                    '🔔 Payment reminders'
                ],
                buttonText: 'Next →'
            },
            {
                title: '🐜 Ready to start?',
                subtitle: 'Your colony awaits!',
                description: 'Sign up for free and start tracking your finances today. Your ants are ready to work!',
                buttonText: 'Get Started Free',
                secondaryButton: 'Explore Demo First'
            }
        ],
        skipText: 'Skip tour',
        stepOf: 'of'
    },
    es: {
        steps: [
            {
                title: '👋 ¡Bienvenido a Ant Pool!',
                subtitle: 'Tu compañero de finanzas personales',
                description: 'En solo 30 segundos, descubre cómo nuestras hormigas te ayudan a controlar tu dinero.',
                buttonText: 'Iniciar Tour →'
            },
            {
                title: '🏠 Tu Colonia Personal',
                subtitle: 'Controla TUS finanzas',
                description: 'Crea presupuestos, rastrea inversiones y establece metas de ahorro. Todo en un solo lugar, solo para ti.',
                features: [
                    '📊 Seguimiento inteligente de presupuesto',
                    '📈 Portafolio de inversiones',
                    '🎯 Metas financieras'
                ],
                buttonText: 'Siguiente →'
            },
            {
                title: '👥 Grupos Compartidos',
                subtitle: 'Divide gastos fácilmente',
                description: 'Crea grupos con roommates, amigos o compañeros de viaje. No más conversaciones incómodas de "quién debe a quién".',
                features: [
                    '💸 Cálculo automático de divisiones',
                    '⚖️ Liquidaciones inteligentes',
                    '🔔 Recordatorios de pago'
                ],
                buttonText: 'Siguiente →'
            },
            {
                title: '🐜 ¿Listo para empezar?',
                subtitle: '¡Tu colonia te espera!',
                description: 'Regístrate gratis y empieza a controlar tus finanzas hoy. ¡Tus hormigas están listas para trabajar!',
                buttonText: 'Empezar Gratis',
                secondaryButton: 'Explorar Demo Primero'
            }
        ],
        skipText: 'Saltar tour',
        stepOf: 'de'
    }
};

/**
 * Start the guided tutorial
 */
function startDemoTutorial() {
    // Check if user already saw the tutorial
    const tutorialSeen = localStorage.getItem('antpool_demo_tutorial_seen');
    if (tutorialSeen) {
        return; // Don't show again
    }
    
    // Close any modal that might interfere (beta modal, etc.)
    const betaModal = document.getElementById('betaLaunchModal');
    if (betaModal && (betaModal.style.display === 'flex' || betaModal.classList.contains('active'))) {
        console.log('🎮 Closing beta modal for tutorial');
        betaModal.classList.remove('active');
        betaModal.style.display = 'none';
    }
    
    // Close any other open modals
    document.querySelectorAll('.modal-overlay.active, .modal-overlay[style*="display: flex"]').forEach(modal => {
        if (modal.id !== 'tutorialOverlay') {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    });
    
    tutorialActive = true;
    tutorialStep = 0;
    
    // Track tutorial start
    if (typeof gtag === 'function') {
        gtag('event', 'tutorial_start', {
            'event_category': 'engagement',
            'event_label': 'demo_tutorial'
        });
    }
    
    renderTutorialOverlay();
}

/**
 * Skip the tutorial
 */
function skipDemoTutorial() {
    tutorialActive = false;
    tutorialStep = 0;
    
    // Mark as seen
    localStorage.setItem('antpool_demo_tutorial_seen', 'skipped');
    
    // Track skip
    if (typeof gtag === 'function') {
        gtag('event', 'tutorial_skip', {
            'event_category': 'engagement',
            'event_label': 'demo_tutorial',
            'value': tutorialStep
        });
    }
    
    removeTutorialOverlay();
    
    // IMPORTANT: Re-display demo groups to ensure they're visible after skipping
    console.log('[Tutorial] Tutorial skipped, ensuring demo groups visible');
    setTimeout(() => {
        displayDemoGroups();
        showDemoSignupCTA();
    }, 500);
}

/**
 * Go to next tutorial step
 */
function nextTutorialStep() {
    console.log('[Tutorial] nextTutorialStep called, current step:', tutorialStep);
    tutorialStep++;
    
    if (tutorialStep >= TUTORIAL_STEPS.length) {
        completeTutorial();
        return;
    }
    
    console.log('[Tutorial] Rendering step:', tutorialStep);
    renderTutorialOverlay();
}

/**
 * Go to previous tutorial step
 */
function prevTutorialStep() {
    if (tutorialStep > 0) {
        tutorialStep--;
        renderTutorialOverlay();
    }
}

/**
 * Complete the tutorial
 */
function completeTutorial() {
    tutorialActive = false;
    
    // Mark as seen
    localStorage.setItem('antpool_demo_tutorial_seen', 'completed');
    
    // Track completion
    if (typeof gtag === 'function') {
        gtag('event', 'tutorial_complete', {
            'event_category': 'engagement',
            'event_label': 'demo_tutorial'
        });
    }
    
    removeTutorialOverlay();
    
    // IMPORTANT: Re-display demo groups to ensure they're visible after tutorial
    console.log('[Tutorial] Tutorial completed, ensuring demo groups visible');
    setTimeout(() => {
        displayDemoGroups();
        
        // Show floating CTA after completing (unless user clicks sign up)
        if (isDemoMode) {
            showDemoSignupCTA();
        }
    }, 500);
}

/**
 * Render the tutorial overlay with current step
 */
function renderTutorialOverlay() {
    const lang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en') || 'en';
    const t = TUTORIAL_TRANSLATIONS[lang] || TUTORIAL_TRANSLATIONS.en;
    const stepData = t.steps[tutorialStep];
    const stepConfig = TUTORIAL_STEPS[tutorialStep];
    
    // CRITICAL: Ensure demo groups are visible BEFORE rendering tutorial
    // This fixes the issue where empty state appears during tutorial
    const emptyState = document.getElementById('emptyState');
    const groupsGrid = document.getElementById('groupsGrid');
    if (emptyState && emptyState.style.display !== 'none') {
        console.log('[Tutorial] Hiding empty state that appeared during tutorial');
        emptyState.style.display = 'none';
    }
    if (groupsGrid && !groupsGrid.querySelector('.demo-fund-card')) {
        console.log('[Tutorial] Demo cards missing, re-displaying');
        displayDemoGroups();
    }
    
    // Scroll target element into view if it exists
    if (stepConfig.target) {
        const targetEl = document.querySelector(stepConfig.target);
        if (targetEl) {
            // Scroll element into view smoothly
            targetEl.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
    }
    
    // Ensure beta modal and other modals are closed
    const betaModal = document.getElementById('betaLaunchModal');
    if (betaModal) {
        betaModal.classList.remove('active');
        betaModal.style.display = 'none';
    }
    
    // Remove existing overlay immediately for step transitions
    removeTutorialOverlay(true);
    
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    overlay.className = 'tutorial-overlay';
    
    // Find target element for spotlight
    let tooltipPositionStyle = '';
    let tooltipPositionClass = stepConfig.position || 'center';
    
    if (stepConfig.target && stepConfig.position === 'auto') {
        const targetEl = document.querySelector(stepConfig.target);
        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const tooltipMargin = 20; // Space between spotlight and tooltip
            
            console.log('[Tutorial] Viewport:', viewportWidth, 'x', viewportHeight, 'Target rect:', rect.top, '-', rect.bottom);
            
            // Simple rule: if element is in upper half, tooltip goes to bottom; otherwise top
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = viewportHeight / 2;
            
            console.log('[Tutorial] Element center:', elementCenter, 'Viewport center:', viewportCenter);
            
            if (elementCenter < viewportCenter) {
                // Element is in upper half - position tooltip at bottom of screen
                tooltipPositionClass = 'bottom-fixed';
                tooltipPositionStyle = '';
                console.log('[Tutorial] Element in upper half, tooltip at bottom');
            } else {
                // Element is in lower half - position tooltip at top of screen
                tooltipPositionClass = 'top-fixed';
                tooltipPositionStyle = '';
                console.log('[Tutorial] Element in lower half, tooltip at top');
            }
        } else {
            // Target not found - center the tooltip
            tooltipPositionClass = 'center';
            console.log('[Tutorial] Target not found, centering tooltip');
        }
    }
    
    // Build features list if available
    let featuresHtml = '';
    if (stepData.features && stepData.features.length > 0) {
        featuresHtml = `
            <div class="tutorial-features">
                ${stepData.features.map(f => `<div class="tutorial-feature">${f}</div>`).join('')}
            </div>
        `;
    }
    
    // Build secondary button if available
    let secondaryButtonHtml = '';
    if (stepData.secondaryButton) {
        secondaryButtonHtml = `
            <button class="tutorial-btn-secondary" id="tutorialSecondaryBtn">
                ${stepData.secondaryButton}
            </button>
        `;
    }
    
    // Progress dots
    const progressDots = TUTORIAL_STEPS.map((_, i) => 
        `<span class="tutorial-dot ${i === tutorialStep ? 'active' : ''} ${i < tutorialStep ? 'completed' : ''}"></span>`
    ).join('');
    
    // Is this the final step?
    const isFinalStep = tutorialStep === TUTORIAL_STEPS.length - 1;
    const isFirstStep = tutorialStep === 0;
    
    // Create spotlight ring HTML if we have a target
    let spotlightRingHtml = '';
    if (stepConfig.target) {
        const targetEl = document.querySelector(stepConfig.target);
        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            const padding = 12;
            
            // Only create spotlight if element is visible and has reasonable dimensions
            const isVisible = rect.width > 50 && rect.height > 50 && 
                              rect.top >= -100 && rect.left >= -100 &&
                              rect.bottom <= window.innerHeight + 100;
            
            if (isVisible) {
                spotlightRingHtml = `
                    <div class="tutorial-spotlight-ring" style="
                        top: ${rect.top - padding}px;
                        left: ${rect.left - padding}px;
                        width: ${rect.width + padding * 2}px;
                        height: ${rect.height + padding * 2}px;
                    "></div>
                `;
                console.log('[Tutorial] Spotlight for', stepConfig.target, 'at', rect.top, rect.left);
            } else {
                console.log('[Tutorial] Skipping spotlight - element not visible:', stepConfig.target, rect);
            }
        } else {
            console.log('[Tutorial] Target element not found:', stepConfig.target);
        }
    }
    
    overlay.innerHTML = `
        <div class="tutorial-backdrop"></div>
        ${spotlightRingHtml}
        
        <!-- Emergency exit button - always visible -->
        <button class="tutorial-emergency-exit" onclick="window.skipDemoTutorial()" title="Exit Tutorial (ESC)">
            ✕ Exit
        </button>
        
        <div class="tutorial-tooltip ${tooltipPositionClass}" style="${tooltipPositionStyle}">
            <div class="tutorial-tooltip-header">
                ${!isFirstStep ? `
                    <button class="tutorial-back-btn" onclick="window.prevTutorialStep()">
                        ← 
                    </button>
                ` : `
                    <button class="tutorial-close-btn" onclick="window.skipDemoTutorial()">
                        ✕
                    </button>
                `}
                <div class="tutorial-progress">
                    ${progressDots}
                </div>
                <button class="tutorial-skip-btn" onclick="window.skipDemoTutorial()">
                    ${t.skipText}
                </button>
            </div>
            
            <div class="tutorial-tooltip-content">
                <div class="tutorial-ant-icon">
                    <span class="tutorial-ant">🐜</span>
                </div>
                
                <h2 class="tutorial-title">${stepData.title}</h2>
                <p class="tutorial-subtitle">${stepData.subtitle}</p>
                <p class="tutorial-description">${stepData.description}</p>
                
                ${featuresHtml}
            </div>
            
            <div class="tutorial-tooltip-footer">
                ${isFinalStep ? `
                    <button class="tutorial-btn-primary pulse" id="tutorialPrimaryBtn" data-action="signup">
                        ${stepData.buttonText}
                    </button>
                    ${secondaryButtonHtml}
                ` : `
                    <button class="tutorial-btn-primary" id="tutorialPrimaryBtn" data-action="next">
                        ${stepData.buttonText}
                    </button>
                `}
                
                <div class="tutorial-step-counter">
                    ${tutorialStep + 1} ${t.stepOf} ${TUTORIAL_STEPS.length}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Simple scroll lock - just prevent scrolling
    document.body.style.overflow = 'hidden';
    
    // Click on dark area = skip tutorial (but NOT on tooltip)
    overlay.addEventListener('click', (e) => {
        // Only close if clicking directly on overlay, backdrop, or spotlight ring
        // NOT if clicking inside the tooltip
        if (e.target === overlay || 
            e.target.classList.contains('tutorial-backdrop') || 
            e.target.classList.contains('tutorial-spotlight-ring')) {
            skipDemoTutorial();
        }
    });
    
    // ESC key to close tutorial
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', escHandler);
            skipDemoTutorial();
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Emergency exit: triple tap anywhere closes tutorial
    let tapCount = 0;
    let tapTimer = null;
    overlay.addEventListener('touchstart', () => {
        tapCount++;
        if (tapCount >= 3) {
            skipDemoTutorial();
            return;
        }
        if (tapTimer) clearTimeout(tapTimer);
        tapTimer = setTimeout(() => { tapCount = 0; }, 500);
    });
    
    // Prevent clicks inside tooltip from bubbling up
    const tooltip = overlay.querySelector('.tutorial-tooltip');
    if (tooltip) {
        tooltip.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Attach click handler to primary button using ID
    const primaryBtn = overlay.querySelector('#tutorialPrimaryBtn');
    if (primaryBtn) {
        primaryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = primaryBtn.dataset.action;
            console.log('[Tutorial] Primary button clicked, action:', action);
            
            if (action === 'next') {
                nextTutorialStep();
            } else if (action === 'signup') {
                // Complete tutorial first, then open signup
                completeTutorial();
                if (typeof window.promptDemoSignup === 'function') {
                    window.promptDemoSignup('tutorial_complete');
                }
            }
        });
    }
    
    // Attach click handler to secondary button (Explore Demo First)
    const secondaryBtn = overlay.querySelector('#tutorialSecondaryBtn');
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Tutorial] Secondary button clicked - explore demo');
            completeTutorial();
        });
    }
    
    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('visible');
    });
}

/**
 * Remove tutorial overlay
 */
function removeTutorialOverlay(immediate = false) {
    const overlay = document.getElementById('tutorialOverlay');
    if (overlay) {
        if (immediate) {
            // Remove immediately for step transitions
            overlay.remove();
        } else {
            // Animate out for closing tutorial
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 300);
        }
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
}

/**
 * Inject tutorial styles
 */
function injectTutorialStyles() {
    if (document.getElementById('tutorialStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'tutorialStyles';
    styles.textContent = `
        /* Tutorial Overlay Base */
        .tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: auto;
        }
        
        .tutorial-overlay.visible {
            opacity: 1;
        }
        
        /* Emergency exit button - always visible in corner */
        .tutorial-emergency-exit {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 100010;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            pointer-events: auto !important;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        
        .tutorial-emergency-exit:hover {
            background: rgba(239, 68, 68, 1);
        }
        
        /* Semi-transparent backdrop - darker to hide content better */
        .tutorial-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.92);
            pointer-events: auto;
            cursor: pointer;
        }
        
        [data-theme="light"] .tutorial-backdrop {
            background: rgba(0, 0, 0, 0.88);
        }
        
        /* Spotlight ring with box-shadow cutout - darker for better contrast */
        .tutorial-spotlight-ring {
            position: fixed;
            border-radius: 16px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.92);
            pointer-events: none;
            z-index: 1;
            transition: all 0.4s ease;
            border: 2px solid rgba(102, 126, 234, 0.6);
        }
        
        [data-theme="light"] .tutorial-spotlight-ring {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.88);
        }
        
        /* Tutorial Tooltip */
        .tutorial-tooltip {
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            max-height: calc(100vh - 80px);
            max-height: calc(100dvh - 80px);
            overflow-y: auto;
            background: linear-gradient(145deg, #1e1e2f 0%, #151525 100%);
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 20px;
            padding: 1.25rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 
                        0 0 40px rgba(102, 126, 234, 0.15);
            z-index: 100001;
            animation: tooltipSlideIn 0.4s ease;
            pointer-events: auto;
            touch-action: auto;
            box-sizing: border-box;
        }
        
        .tutorial-tooltip button {
            pointer-events: auto;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }
        
        @keyframes tooltipSlideIn {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        .tutorial-tooltip.center {
            top: 50%;
            transform: translate(-50%, -50%);
            max-height: calc(100vh - 40px);
            max-height: calc(100dvh - 40px);
        }
        
        /* Safe positioning for small screens */
        @media (max-height: 650px) {
            .tutorial-tooltip.center {
                top: 20px;
                transform: translateX(-50%);
                max-height: calc(100vh - 40px);
                max-height: calc(100dvh - 40px);
            }
        }
        
        .tutorial-tooltip.center {
            animation: tooltipFadeIn 0.4s ease;
        }
        
        @keyframes tooltipFadeIn {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        /* Bottom-safe positioning - forces tooltip to bottom of viewport */
        .tutorial-tooltip.bottom-safe {
            top: auto !important;
            bottom: 20px !important;
            transform: translateX(-50%);
        }
        
        /* Fixed bottom positioning for small viewports */
        .tutorial-tooltip.bottom-fixed {
            top: auto !important;
            bottom: 100px !important;
            transform: translateX(-50%);
        }
        
        /* Fixed top positioning when element is in lower half */
        .tutorial-tooltip.top-fixed {
            top: 80px !important;
            bottom: auto !important;
            transform: translateX(-50%);
        }
        
        /* Positioned class - uses inline top style */
        .tutorial-tooltip.positioned {
            transform: translateX(-50%);
        }
        
        .tutorial-tooltip.bottom {
            transform: translateX(-50%);
        }
        
        /* Light mode tooltip */
        [data-theme="light"] .tutorial-tooltip {
            background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
            border: 1px solid rgba(102, 126, 234, 0.2);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 
                        0 0 40px rgba(102, 126, 234, 0.1);
        }
        
        /* Header */
        .tutorial-tooltip-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.25rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        [data-theme="light"] .tutorial-tooltip-header {
            border-bottom-color: rgba(0, 0, 0, 0.1);
        }
        
        .tutorial-back-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: rgba(255, 255, 255, 0.7);
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        
        .tutorial-back-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            color: white;
        }
        
        [data-theme="light"] .tutorial-back-btn {
            background: rgba(0, 0, 0, 0.05);
            color: rgba(0, 0, 0, 0.6);
        }
        
        [data-theme="light"] .tutorial-back-btn:hover {
            background: rgba(0, 0, 0, 0.1);
            color: rgba(0, 0, 0, 0.9);
        }
        
        .tutorial-skip-btn {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.8rem;
            cursor: pointer;
            padding: 0.5rem;
            transition: color 0.2s;
        }
        
        .tutorial-skip-btn:hover {
            color: rgba(255, 255, 255, 0.8);
        }
        
        [data-theme="light"] .tutorial-skip-btn {
            color: rgba(0, 0, 0, 0.4);
        }
        
        [data-theme="light"] .tutorial-skip-btn:hover {
            color: rgba(0, 0, 0, 0.7);
        }
        
        .tutorial-close-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: rgba(255, 255, 255, 0.7);
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.1rem;
            transition: all 0.2s;
        }
        
        .tutorial-close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
        
        [data-theme="light"] .tutorial-close-btn {
            background: rgba(0, 0, 0, 0.05);
            color: rgba(0, 0, 0, 0.6);
        }
        
        [data-theme="light"] .tutorial-close-btn:hover {
            background: rgba(0, 0, 0, 0.1);
            color: rgba(0, 0, 0, 0.9);
        }
        
        /* Progress dots */
        .tutorial-progress {
            display: flex;
            gap: 0.5rem;
        }
        
        .tutorial-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }
        
        .tutorial-dot.active {
            background: linear-gradient(135deg, #667eea, #764ba2);
            width: 24px;
            border-radius: 4px;
        }
        
        .tutorial-dot.completed {
            background: #22c55e;
        }
        
        [data-theme="light"] .tutorial-dot {
            background: rgba(0, 0, 0, 0.15);
        }
        
        /* Content */
        .tutorial-tooltip-content {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        
        .tutorial-ant-icon {
            margin-bottom: 1rem;
        }
        
        .tutorial-ant {
            font-size: 3rem;
            display: inline-block;
            animation: antBounce 1s ease infinite;
        }
        
        @keyframes antBounce {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-5px) rotate(-5deg); }
            75% { transform: translateY(-5px) rotate(5deg); }
        }
        
        .tutorial-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            margin: 0 0 0.25rem 0;
            background: linear-gradient(135deg, #667eea, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        [data-theme="light"] .tutorial-title {
            background: linear-gradient(135deg, #5b4ed4, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .tutorial-subtitle {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.8);
            margin: 0 0 0.75rem 0;
            font-weight: 500;
        }
        
        [data-theme="light"] .tutorial-subtitle {
            color: rgba(0, 0, 0, 0.7);
        }
        
        .tutorial-description {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
            line-height: 1.5;
        }
        
        [data-theme="light"] .tutorial-description {
            color: rgba(0, 0, 0, 0.6);
        }
        
        /* Features list */
        .tutorial-features {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 1rem;
            padding: 1rem;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 12px;
            border: 1px solid rgba(102, 126, 234, 0.2);
        }
        
        .tutorial-feature {
            color: #4ade80;
            font-size: 0.9rem;
            text-align: left;
        }
        
        [data-theme="light"] .tutorial-features {
            background: rgba(102, 126, 234, 0.08);
        }
        
        /* Footer */
        .tutorial-tooltip-footer {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            align-items: center;
            position: relative;
            z-index: 10;
        }
        
        .tutorial-btn-primary {
            width: 100%;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            position: relative;
            z-index: 20;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .tutorial-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        
        .tutorial-btn-primary.pulse {
            animation: btnPulse 2s ease infinite;
        }
        
        @keyframes btnPulse {
            0%, 100% { box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
            50% { box-shadow: 0 4px 25px rgba(102, 126, 234, 0.6), 0 0 40px rgba(102, 126, 234, 0.3); }
        }
        
        .tutorial-btn-secondary {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.7);
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .tutorial-btn-secondary:hover {
            border-color: rgba(255, 255, 255, 0.4);
            color: white;
        }
        
        [data-theme="light"] .tutorial-btn-secondary {
            border-color: rgba(0, 0, 0, 0.15);
            color: rgba(0, 0, 0, 0.6);
        }
        
        [data-theme="light"] .tutorial-btn-secondary:hover {
            border-color: rgba(0, 0, 0, 0.3);
            color: rgba(0, 0, 0, 0.9);
        }
        
        .tutorial-step-counter {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.4);
        }
        
        [data-theme="light"] .tutorial-step-counter {
            color: rgba(0, 0, 0, 0.4);
        }
        
        /* Ensure tooltip is always visible within viewport */
        @media (max-height: 700px) {
            .tutorial-tooltip {
                max-height: calc(100vh - 60px);
                max-height: calc(100dvh - 60px);
                overflow-y: auto;
                padding: 1rem;
            }
            
            .tutorial-tooltip.center {
                top: 30px !important;
                transform: translateX(-50%) !important;
            }
            
            .tutorial-tooltip.bottom,
            .tutorial-tooltip.bottom-safe {
                top: auto !important;
                bottom: 10px !important;
            }
            
            .tutorial-features {
                padding: 0.5rem !important;
            }
            
            .tutorial-title {
                font-size: 1.1rem !important;
                margin-bottom: 0.25rem !important;
            }
            
            .tutorial-ant-icon {
                margin-bottom: 0.5rem !important;
            }
            
            .tutorial-ant {
                font-size: 2rem !important;
            }
            
            .tutorial-tooltip-content {
                margin-bottom: 1rem !important;
            }
            
            .tutorial-btn-primary {
                padding: 0.75rem 1.5rem !important;
            }
        }
        
        /* Mobile adjustments */
        @media (max-width: 600px) {
            .tutorial-tooltip {
                width: calc(100% - 1.5rem);
                max-width: none;
                left: 50%;
                right: auto;
                margin: 0;
                padding: 1rem;
                border-radius: 16px;
            }
            
            .tutorial-tooltip.center {
                max-height: calc(100vh - 40px);
                max-height: calc(100dvh - 40px);
            }
            
            .tutorial-tooltip.bottom {
                top: auto !important;
                bottom: 1rem;
            }
            
            .tutorial-title {
                font-size: 1.2rem;
            }
            
            .tutorial-subtitle {
                font-size: 0.9rem;
            }
            
            .tutorial-description {
                font-size: 0.85rem;
            }
            
            .tutorial-ant {
                font-size: 2.5rem;
            }
            
            .tutorial-btn-primary {
                padding: 0.875rem 1.5rem;
                font-size: 0.95rem;
            }
            
            .tutorial-btn-secondary {
                padding: 0.625rem 1.25rem;
                font-size: 0.85rem;
            }
        }
        
        /* Very small screens (short height) */
        @media (max-height: 550px) {
            .tutorial-tooltip {
                padding: 0.75rem;
            }
            
            .tutorial-tooltip.center {
                top: 10px !important;
                transform: translateX(-50%) !important;
                max-height: calc(100vh - 20px);
                max-height: calc(100dvh - 20px);
            }
            
            .tutorial-ant-icon {
                display: none !important;
            }
            
            .tutorial-tooltip-header {
                margin-bottom: 0.75rem !important;
                padding-bottom: 0.5rem !important;
            }
            
            .tutorial-tooltip-content {
                margin-bottom: 0.75rem !important;
            }
            
            .tutorial-features {
                margin-top: 0.5rem !important;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

// Inject tutorial styles
injectTutorialStyles();

// Export tutorial functions
window.startDemoTutorial = startDemoTutorial;
window.skipDemoTutorial = skipDemoTutorial;
window.nextTutorialStep = nextTutorialStep;
window.prevTutorialStep = prevTutorialStep;
window.completeDemoTutorial = completeTutorial;

// EMERGENCY: Force exit tutorial if stuck (can be called from console)
window.emergencyExitTutorial = function() {
    console.log('🚨 Emergency exit tutorial triggered');
    tutorialActive = false;
    tutorialStep = 0;
    const overlay = document.getElementById('tutorialOverlay');
    if (overlay) overlay.remove();
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    console.log('✅ Tutorial forcefully closed');
};

// Export functions for use in app-platform.js
window.DemoMode = {
    isActive: isInDemoMode,
    enter: enterDemoMode,
    exit: exitDemoMode,
    showActionModal: showDemoActionModal,
    promptSignup: promptDemoSignup,
    getDemoGroup: () => DEMO_GROUP_DATA,
    getDemoUser: () => DEMO_CURRENT_USER,
    getDemoPersonalColony: () => DEMO_PERSONAL_COLONY_DATA,
    displayDemoGroups: displayDemoGroups,
    startTutorial: startDemoTutorial
};

// Expose functions globally for onclick handlers in HTML
window.openDemoGroup = openDemoGroup;
window.openDemoPersonalColony = openDemoPersonalColony;
window.switchDemoPersonalTab = switchDemoPersonalTab;
window.showDemoActionModal = showDemoActionModal;
window.closeDemoActionModal = closeDemoActionModal;
window.promptDemoSignup = promptDemoSignup;
window.minimizeDemoSignupCTA = minimizeDemoSignupCTA;

// Auto-enter demo mode if URL has ?demo=true parameter
(function checkDemoUrlParam() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
        // Wait for DOM and Firebase to be ready, then enter demo mode
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                if (!isInDemoMode() && window.DemoMode && typeof window.DemoMode.enter === 'function') {
                    window.DemoMode.enter();
                    // Clean up URL without reloading
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }, 500);
        });
    }
})();
