/**
 * Demo Mode System for Ant Pool
 * Allows unauthenticated users to explore the app with sample data
 */

// ============================================
// DEMO MODE STATE
// ============================================
let isDemoMode = false;

// ============================================
// DEMO DATA - Sample Simple Mode group (NOT blockchain)
// Structure matches exactly what loadUserFunds() creates for Simple Mode
// ============================================
const DEMO_GROUP_DATA = {
    // These fields match the fundData structure in app-platform.js line ~1337
    fundAddress: 'demo-roommates-2026', // groupId used as identifier
    fundName: 'Apartment Expenses',
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
    isDemoMode = true;
    
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
    
    console.log('🎭 Demo Mode activated');
}

/**
 * Exit demo mode - called when user signs in
 */
function exitDemoMode() {
    isDemoMode = false;
    hideDemoBanner();
    hideDemoSignupCTA();
    console.log('🎭 Demo Mode deactivated');
}

/**
 * Show the demo mode banner at the top
 */
function showDemoBanner() {
    let banner = document.getElementById('demoBanner');
    
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'demoBanner';
        banner.className = 'demo-banner';
        banner.innerHTML = `
            <div class="demo-banner-content">
                <span class="demo-banner-icon">🎭</span>
                <span class="demo-banner-text" data-i18n="app.demo.bannerText">Demo Mode - Exploring how Ant Pool works</span>
            </div>
        `;
        
        // Insert at the beginning of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(banner, mainContent.firstChild);
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
        cta.innerHTML = `
            <div class="demo-cta-content">
                <div class="demo-cta-text">
                    <strong data-i18n="app.demo.ctaTitle">Like what you see?</strong>
                    <span data-i18n="app.demo.ctaSubtitle">Create your real group in 30 seconds</span>
                </div>
                <button class="btn btn-primary demo-cta-button" onclick="promptDemoSignup('floating_cta')">
                    <span data-i18n="app.demo.ctaButton">Create My Group →</span>
                </button>
            </div>
            <button class="demo-cta-close" onclick="minimizeDemoSignupCTA()" title="Minimize">−</button>
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
    
    // Get translated strings
    const translations = {
        en: {
            title: '🐜 Ready to take action?',
            subtitle: 'Sign in to create your own group and start tracking real expenses with your friends.',
            benefit1: '✓ Create unlimited groups',
            benefit2: '✓ Invite friends by email',
            benefit3: '✓ Track expenses in real-time',
            benefit4: '✓ Get smart settlement suggestions',
            button: 'Sign In to Continue',
            later: 'Keep Exploring Demo'
        },
        es: {
            title: '🐜 ¿Listo para actuar?',
            subtitle: 'Inicia sesión para crear tu propio grupo y empezar a rastrear gastos reales con tus amigos.',
            benefit1: '✓ Crea grupos ilimitados',
            benefit2: '✓ Invita amigos por email',
            benefit3: '✓ Rastrea gastos en tiempo real',
            benefit4: '✓ Obtén sugerencias inteligentes de liquidación',
            button: 'Inicia Sesión para Continuar',
            later: 'Seguir Explorando Demo'
        }
    };
    
    const lang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en') || 'en';
    const t = translations[lang] || translations.en;
    
    // Create modal
    let modal = document.getElementById('demoActionModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'demoActionModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal demo-action-modal">
            <button class="modal-close" onclick="closeDemoActionModal()">&times;</button>
            <div class="demo-modal-content">
                <div class="demo-modal-icon">🐜</div>
                <h2 class="demo-modal-title">${t.title}</h2>
                <p class="demo-modal-subtitle">${t.subtitle}</p>
                
                <div class="demo-modal-benefits">
                    <div class="demo-benefit">${t.benefit1}</div>
                    <div class="demo-benefit">${t.benefit2}</div>
                    <div class="demo-benefit">${t.benefit3}</div>
                    <div class="demo-benefit">${t.benefit4}</div>
                </div>
                
                <div class="demo-modal-actions">
                    <button class="btn btn-primary btn-large" onclick="promptDemoSignup('action_modal')">
                        ${t.button}
                    </button>
                    <button class="btn btn-ghost" onclick="closeDemoActionModal()">
                        ${t.later}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

/**
 * Close the demo action modal
 */
function closeDemoActionModal() {
    const modal = document.getElementById('demoActionModal');
    if (modal) {
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
    
    // Open sign in modal
    if (typeof openSignInModal === 'function') {
        openSignInModal();
    }
}

/**
 * Load demo data into the app
 */
function loadDemoData() {
    // Set global variables that the app expects
    window.demoGroupData = DEMO_GROUP_DATA;
    window.demoCurrentUser = DEMO_CURRENT_USER;
    
    // Show the demo group in the dashboard
    displayDemoGroups();
    
    // Show the floating CTA after a short delay
    setTimeout(() => {
        showDemoSignupCTA();
    }, 3000);
}

/**
 * Display demo groups in the dashboard
 * Uses the same card format as createFundCard() in app-platform.js
 */
function displayDemoGroups() {
    const groupsGrid = document.getElementById('groupsGrid');
    const emptyState = document.getElementById('emptyState');
    const loadingGroups = document.getElementById('loadingGroups');
    
    if (loadingGroups) loadingGroups.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    
    if (!groupsGrid) return;
    
    // Calculate demo group stats
    const totalExpenses = Object.values(DEMO_GROUP_DATA.expenses)
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const memberCount = Object.keys(DEMO_GROUP_DATA.members).length;
    const expenseCount = Object.keys(DEMO_GROUP_DATA.expenses).length;
    
    // Get translations
    const currentLang = (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en') || 'en';
    const membersText = currentLang === 'es' ? 'miembros' : 'members';
    const balanceText = currentLang === 'es' ? 'Total gastado' : 'Total spent';
    const tapText = currentLang === 'es' ? 'Toca para explorar →' : 'Tap to explore →';
    
    // Render demo group card using the SAME format as createFundCard()
    groupsGrid.innerHTML = `
        <div class="fund-card demo-fund-card" onclick="openDemoGroup()">
            <div class="fund-card-content">
                <div class="demo-badge-corner">DEMO</div>
                
                <div class="fund-card-header">
                    <div class="fund-icon">${DEMO_GROUP_DATA.icon}</div>
                    <div class="fund-card-title">
                        <h3>${DEMO_GROUP_DATA.name}</h3>
                        <div class="fund-badges">
                            <span class="badge badge-mode mode-simple">🐜 Simple</span>
                        </div>
                    </div>
                </div>
                
                <div class="fund-stats">
                    <div class="fund-stat">
                        <span class="fund-stat-label">${balanceText}</span>
                        <span class="fund-stat-value">$${totalExpenses.toFixed(2)} ${DEMO_GROUP_DATA.currency}</span>
                    </div>
                </div>
                
                <div class="fund-meta">
                    <span>👥 ${memberCount} ${membersText}</span>
                    <span>💰 ${expenseCount} expenses</span>
                </div>
                
                <div class="demo-tap-hint">
                    <span>${tapText}</span>
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
    
    if (totalGroupsCreated) totalGroupsCreated.textContent = '1';
    if (totalGroupsParticipating) totalGroupsParticipating.textContent = '1';
    if (totalGroupsJoined) totalGroupsJoined.textContent = '1';
    if (countAll) countAll.textContent = '1';
    if (countCreated) countCreated.textContent = '1';
    if (countParticipating) countParticipating.textContent = '1';
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
    
    // Show fund detail section
    const dashboardSection = document.getElementById('dashboardSection');
    const fundDetailSection = document.getElementById('fundDetailSection');
    
    if (dashboardSection) dashboardSection.classList.remove('active');
    if (fundDetailSection) fundDetailSection.classList.add('active');
    
    // Populate with demo data
    populateDemoGroupDetail();
}

/**
 * Populate the group detail view with demo data
 */
function populateDemoGroupDetail() {
    const group = DEMO_GROUP_DATA;
    
    // Header
    const fundDetailName = document.getElementById('fundDetailName');
    const fundDetailDescription = document.getElementById('fundDetailDescription');
    const fundHeaderIcon = document.getElementById('fundHeaderIcon');
    
    if (fundDetailName) fundDetailName.textContent = group.name;
    if (fundDetailDescription) fundDetailDescription.textContent = group.description;
    if (fundHeaderIcon) fundHeaderIcon.textContent = group.icon;
    
    // Calculate balances
    const totalExpenses = Object.values(group.expenses)
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + e.amount, 0);
    
    // Update balance displays
    const balanceDisplays = document.querySelectorAll('[id*="totalBalance"], [id*="fundBalance"]');
    balanceDisplays.forEach(el => {
        el.textContent = `$${totalExpenses.toFixed(2)}`;
    });
    
    // Render expenses in timeline
    renderDemoTimeline();
    
    // Render members
    renderDemoMembers();
    
    // Show demo-specific UI
    showDemoGroupUI();
}

/**
 * Render the demo timeline with expenses
 */
function renderDemoTimeline() {
    const timelineContainer = document.getElementById('timelineContainer') || 
                              document.getElementById('expensesList') ||
                              document.querySelector('.timeline-list');
    
    if (!timelineContainer) return;
    
    const expenses = Object.values(DEMO_GROUP_DATA.expenses)
        .sort((a, b) => b.createdAt - a.createdAt);
    
    let html = '';
    
    for (const expense of expenses) {
        const paidByName = DEMO_GROUP_DATA.members[expense.paidBy[0]]?.name || 'Unknown';
        const timeAgo = getTimeAgo(expense.createdAt);
        
        html += `
            <div class="timeline-item expense-item demo-item" onclick="showDemoActionModal('view_expense')">
                <div class="timeline-icon">💵</div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-title">${expense.description}</span>
                        <span class="timeline-amount">$${expense.amount.toFixed(2)}</span>
                    </div>
                    <div class="timeline-meta">
                        <span>${paidByName} paid</span>
                        <span>•</span>
                        <span>${timeAgo}</span>
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
    // Override action buttons to show demo modal
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const inviteMemberBtn = document.getElementById('inviteMemberBtn');
    const settleUpBtn = document.getElementById('settleUpBtn');
    
    if (addExpenseBtn) {
        addExpenseBtn.onclick = () => showDemoActionModal('add_expense');
    }
    
    if (inviteMemberBtn) {
        inviteMemberBtn.onclick = () => showDemoActionModal('invite_member');
    }
    
    if (settleUpBtn) {
        settleUpBtn.onclick = () => showDemoActionModal('settle_up');
    }
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

// Export functions for use in app-platform.js
window.DemoMode = {
    isActive: isInDemoMode,
    enter: enterDemoMode,
    exit: exitDemoMode,
    showActionModal: showDemoActionModal,
    promptSignup: promptDemoSignup,
    getDemoGroup: () => DEMO_GROUP_DATA,
    getDemoUser: () => DEMO_CURRENT_USER
};
