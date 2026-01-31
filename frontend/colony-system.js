// ============================================
// COLONIA VIVA SYSTEM - Ant Pool
// ============================================
// Sistema de visualización de organización grupal
// NO afecta balances ni lógica financiera

// Store current chest context
let currentChestGroupId = null;

const COLONY_STATES = {
    forming: {
        visual: {
            ant: 'simple',
            paths: 'scattered',
            base: 'basic',
            ambient: 'dim'
        }
    },
    active: {
        visual: {
            ant: 'moving',
            paths: 'connected',
            base: 'structured',
            ambient: 'warm'
        }
    },
    stable: {
        visual: {
            ant: 'coordinated',
            paths: 'organized',
            base: 'solid',
            ambient: 'bright'
        }
    },
    consolidated: {
        visual: {
            ant: 'efficient',
            paths: 'optimized',
            base: 'advanced',
            ambient: 'radiant'
        }
    }
};

// Feature flag
const COLONY_FEATURE_ENABLED = true;

/**
 * Get current colony data for a group
 */
async function getColonyData(groupId) {
    if (!COLONY_FEATURE_ENABLED) return null;
    
    try {
        const db = firebase.database();
        const snapshot = await db.ref(`groups/${groupId}/colony`).once('value');
        const data = snapshot.val();
        
        // Default colony state if not exists
        if (!data) {
            return {
                state: 'forming',
                visual: COLONY_STATES.forming.visual,
                lastUpdatedAt: Date.now()
            };
        }
        
        return data;
    } catch (error) {
        console.error('Error getting colony data:', error);
        return null;
    }
}

/**
 * Get weekly chest for a group
 */
async function getWeeklyChest(groupId, weekId) {
    if (!COLONY_FEATURE_ENABLED) return null;
    
    try {
        const db = firebase.database();
        const snapshot = await db.ref(`weeklyChests/${groupId}/${weekId}`).once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error getting weekly chest:', error);
        return null;
    }
}

/**
 * Get current week ID (YYYY-Wxx format)
 */
function getCurrentWeekId(weekOffset = 0) {
    const now = new Date();
    
    // Apply week offset (negative for past weeks, positive for future)
    if (weekOffset !== 0) {
        now.setDate(now.getDate() + (weekOffset * 7));
    }
    
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Open weekly chest (mark as opened)
 */
async function openWeeklyChest(groupId, weekId) {
    if (!COLONY_FEATURE_ENABLED) return false;
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('User not authenticated');
            return false;
        }
        
        const db = firebase.database();
        
        // Verify user is member of the group
        const memberSnapshot = await db.ref(`groups/${groupId}/members/${user.uid}`).once('value');
        if (!memberSnapshot.exists()) {
            console.error('User is not a member of this group');
            return false;
        }
        
        // Mark chest as opened
        const openedAt = Date.now();
        await db.ref(`weeklyChests/${groupId}/${weekId}`).update({
            isOpened: true,
            openedBy: user.uid,
            openedAt: openedAt
        });
        
        // Also save lastChestClaimed in colony data for cooldown calculation
        await db.ref(`groups/${groupId}/colony`).update({
            lastChestClaimed: openedAt
        });
        
        // console.log('[Colony] Chest marked as opened in Firebase, lastChestClaimed updated');
        return true;
    } catch (error) {
        console.error('Error opening weekly chest:', error);
        return false;
    }
}

/**
 * Render colony visual (SVG)
 */
function renderColonyVisual(state = 'forming', size = 80) {
    const config = COLONY_STATES[state];
    
    const colors = {
        forming: { primary: '#94a3b8', secondary: '#cbd5e1', glow: '#e2e8f0' },
        active: { primary: '#667eea', secondary: '#764ba2', glow: '#a78bfa' },
        stable: { primary: '#10b981', secondary: '#059669', glow: '#6ee7b7' },
        consolidated: { primary: '#f59e0b', secondary: '#d97706', glow: '#fbbf24' }
    };
    
    // Use active colors as fallback if state not found
    const c = colors[state] || colors.active;
    
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="colony-visual" style="display: block; margin: 0 auto;">
            <!-- Ambient glow -->
            <defs>
                <radialGradient id="glow-${state}-${size}">
                    <stop offset="0%" style="stop-color:${c.glow};stop-opacity:0.5" />
                    <stop offset="100%" style="stop-color:${c.glow};stop-opacity:0" />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#glow-${state}-${size})" />
            
            <!-- Base structure -->
            <circle cx="50" cy="50" r="30" fill="none" stroke="${c.primary}" stroke-width="2" opacity="0.5" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="${c.primary}" stroke-width="2" opacity="0.7" />
            
            <!-- Paths (connecting lines) -->
            ${state !== 'forming' ? `
                <line x1="30" y1="30" x2="50" y2="50" stroke="${c.secondary}" stroke-width="2" opacity="0.8" />
                <line x1="70" y1="30" x2="50" y2="50" stroke="${c.secondary}" stroke-width="2" opacity="0.8" />
                <line x1="30" y1="70" x2="50" y2="50" stroke="${c.secondary}" stroke-width="2" opacity="0.8" />
                <line x1="70" y1="70" x2="50" y2="50" stroke="${c.secondary}" stroke-width="2" opacity="0.8" />
            ` : ''}
            
            <!-- Ant symbol (center) -->
            <circle cx="50" cy="50" r="12" fill="${c.primary}" />
            <circle cx="44" cy="44" r="4" fill="${c.secondary}" />
            <circle cx="56" cy="44" r="4" fill="${c.secondary}" />
            <ellipse cx="50" cy="56" rx="8" ry="5" fill="${c.primary}" opacity="0.8" />
        </svg>
    `;
}

/**
 * Show weekly chest banner in group view
 */
function showWeeklyChestBanner(groupId, chest) {
    if (!COLONY_FEATURE_ENABLED || !chest) {
        // console.log('[Colony] Banner not shown:', { enabled: COLONY_FEATURE_ENABLED, chest });
        return;
    }
    
    // Remove existing banner if any
    const existingBanner = document.getElementById('weeklyChestBanner');
    if (existingBanner) {
        existingBanner.remove();
    }
    
    const isWelcomeChest = chest.weekId === 'welcome' || chest.isWelcomeChest;
    
    const banner = document.createElement('div');
    banner.id = 'weeklyChestBanner';
    banner.className = 'weekly-chest-banner';
    banner.innerHTML = `
        <div class="chest-banner-content">
            <span class="chest-icon">${isWelcomeChest ? '🎁' : '📦'}</span>
            <div class="chest-text">
                <strong data-i18n="${isWelcomeChest ? 'app.fundDetail.colony.welcomeBannerTitle' : 'app.fundDetail.colony.bannerTitle'}">
                    ${isWelcomeChest ? '🎉 Welcome Chest Available!' : '🎉 Weekly Chest Available!'}
                </strong>
                <small data-i18n="${isWelcomeChest ? 'app.fundDetail.colony.welcomeBannerSubtitle' : 'app.fundDetail.colony.bannerSubtitle'}">
                    ${isWelcomeChest ? 'Your welcome gift is ready!' : 'Your colony completed another week'}
                </small>
            </div>
            <button class="chest-banner-btn" onclick="ColonySystem.openChestModal('${groupId}', '${chest.weekId}')" data-i18n="app.fundDetail.colony.openChestBtn">
                Open Chest
            </button>
        </div>
    `;
    
    // Insert banner in the dedicated container
    const container = document.getElementById('weeklyChestBannerContainer');
    if (container) {
        // console.log('[Colony] Inserting banner into container');
        container.innerHTML = '';
        container.appendChild(banner);
        
        // Apply translations
        if (window.i18n) {
            window.i18n.applyTranslations();
        }
    } else {
        console.error('[Colony] Banner container not found!');
    }
}

/**
 * Open chest modal
 */
async function openChestModal(groupId, weekId) {
    // console.log('[Colony] Opening chest modal:', { groupId, weekId });
    
    // Haptic feedback for chest opening
    if (window.HapticFeedback) {
        HapticFeedback.chestOpen();
    }
    
    // Store groupId for later use in closeChestModal
    currentChestGroupId = groupId;
    
    const chest = await getWeeklyChest(groupId, weekId);
    if (!chest) {
        console.error('[Colony] Chest not found');
        return;
    }
    
    // Validate colonyState - must be one of the valid states
    const validStates = ['forming', 'active', 'stable', 'consolidated'];
    let colonyState = chest.state || 'active';
    if (!validStates.includes(colonyState)) {
        console.warn('[Colony] Invalid state:', colonyState, '- defaulting to active');
        colonyState = 'active';
    }
    const config = COLONY_STATES[colonyState];
    // console.log('[Colony] Chest state:', colonyState);
    
    // Check if this is a welcome chest
    const isWelcomeChest = chest.isWelcomeChest || weekId === 'welcome';
    
    // Get random item from mascot system (if available)
    let rewardItem = null;
    if (window.MascotSystem) {
        const randomItem = window.MascotSystem.getRandomItemByColonyState(colonyState);
        rewardItem = await window.MascotSystem.addItemToWardrobe(groupId, randomItem.id);
        // console.log('[Colony] Reward item:', rewardItem);
        
        // Play reward feedback when item is received
        if (rewardItem && window.HapticFeedback) {
            setTimeout(() => HapticFeedback.reward(), 300);
        }
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'weeklyChestModal';
    modal.onclick = (e) => {
        if (e.target === modal) closeChestModal();
    };
    
    // Get translated state name and description with fallbacks
    const stateName = window.i18n ? window.i18n.t(`app.fundDetail.colony.states.${colonyState}.name`) : (config?.name || colonyState);
    const stateDesc = window.i18n ? window.i18n.t(`app.fundDetail.colony.states.${colonyState}.description`) : (config?.description || '');
    
    // Get chest description with proper fallback (avoid showing "undefined")
    const chestDescription = (chest.description && chest.description !== 'undefined') ? chest.description : stateDesc;
    
    modal.innerHTML = `
        <div class="weekly-chest-modal" onclick="event.stopPropagation()">
            <button class="close-btn" id="closeChestBtnX">&times;</button>
            
            <div class="chest-modal-content">
                <h2 class="chest-modal-title" data-i18n="${isWelcomeChest ? 'app.fundDetail.colony.welcomeChestTitle' : 'app.fundDetail.colony.chestTitle'}">${isWelcomeChest ? '🎁 Cofre de Bienvenida' : '🎁 Cofre de la Colonia'}</h2>
                
                ${isWelcomeChest ? `
                    <div class="welcome-chest-message">
                        <p data-i18n="app.fundDetail.colony.welcomeChestDesc">¡Bienvenido a tu nuevo grupo! Aquí está tu primera prenda para comenzar con el sistema de mascota.</p>
                    </div>
                ` : `
                    <div class="chest-visual-container">
                        ${renderColonyVisual(colonyState, 120)}
                    </div>
                    
                    <div class="chest-state-info">
                        <h3>${stateName}</h3>
                        <p>${chestDescription}</p>
                    </div>
                `}
                
                ${rewardItem ? `
                    <div class="chest-reward-section">
                        <h4 data-i18n="app.fundDetail.colony.rewardTitle">✨ ¡Recompensa Obtenida!</h4>
                        <div class="reward-item">
                            <div class="reward-emoji">${rewardItem.item?.emoji || '🎁'}</div>
                            <div class="reward-info">
                                <p class="reward-name">${window.i18n?.t('app.fundDetail.mascot.wardrobeItems.' + (rewardItem.item?.id || 'unknown')) || rewardItem.item?.name || 'Item'}</p>
                                ${rewardItem.isNew ? '<span class="reward-badge new-badge" data-i18n="app.fundDetail.colony.newBadge">¡NUEVO!</span>' : ''}
                                ${rewardItem.upgraded ? `<span class="reward-badge upgrade-badge"><span data-i18n="app.fundDetail.colony.upgradeBadge">¡Subió a</span> ${window.MascotSystem?.ITEM_LEVELS?.[rewardItem.newLevel]?.name || 'nuevo nivel'}!</span>` : `<span class="reward-copies">${rewardItem.copies || 1}/10 <span data-i18n="app.fundDetail.colony.copies">copias</span></span>`}
                            </div>
                        </div>
                        <p class="reward-hint" data-i18n="app.fundDetail.colony.visitMascot">Visita la pestaña "Mascota" para equipar tus prendas</p>
                    </div>
                ` : ''}
                
                <button class="btn btn-primary btn-block chest-close-btn" id="closeChestBtn" onclick="event.stopPropagation(); ColonySystem.closeChestModal();" data-i18n="app.fundDetail.colony.closeButton">
                    Seguir usando Ant Pool
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    // console.log('[Colony] Modal appended to body');
    
    // Apply translations to modal content
    if (window.i18n) {
        window.i18n.applyTranslations();
    }
    
    // Attach event listener to X close button only (main button uses onclick)
    const closeBtnX = document.getElementById('closeChestBtnX');
    if (closeBtnX) {
        closeBtnX.onclick = (e) => {
            e.stopPropagation();
            closeChestModal();
        };
    }
    
    // Mark as opened
    await openWeeklyChest(groupId, weekId);
    // console.log('[Colony] Chest marked as opened');
    
    // Update mascot header and tab if available
    if (window.MascotSystem) {
        await window.MascotSystem.updateMascotHeader(groupId);
        
        // Reload mascot tab if it's currently active
        const mascotTab = document.getElementById('mascotTab');
        if (mascotTab && mascotTab.classList.contains('active')) {
            await window.MascotSystem.loadMascotTab(groupId);
            // console.log('[Colony] Mascot tab reloaded with new item');
        }
    }
    
    // Remove banner after opening
    const banner = document.getElementById('weeklyChestBanner');
    if (banner) {
        banner.remove();
        // console.log('[Colony] Banner removed');
    }
}

/**
 * Close chest modal
 */
function closeChestModal() {
    const modal = document.getElementById('weeklyChestModal');
    
    // Prevent double execution
    if (!modal) {
        // console.log('[Colony] Modal already closed');
        return;
    }
    
    // console.log('[Colony] Closing chest modal');
    
    // Remove modal immediately
    modal.remove();
    // console.log('[Colony] Modal removed');
    
    // Reload mascot tab if active and we have the groupId
    if (currentChestGroupId && window.MascotSystem) {
        const mascotTab = document.getElementById('mascotTab');
        if (mascotTab && mascotTab.classList.contains('active')) {
            // console.log('[Colony] Reloading mascot tab after closing chest');
            window.MascotSystem.loadMascotTab(currentChestGroupId);
        }
    }
    
    // Clear stored groupId
    currentChestGroupId = null;
}

/**
 * Update colony display in group header
 */
async function updateColonyDisplay(groupId) {
    if (!COLONY_FEATURE_ENABLED) {
        // console.log('[Colony] Feature disabled for display');
        return;
    }
    
    const colony = await getColonyData(groupId);
    // console.log('[Colony] Colony data for display:', colony);
    
    if (!colony) {
        // console.log('[Colony] No colony data available');
        return;
    }
    
    const container = document.getElementById('colonyDisplayContainer');
    
    if (container) {
        // Get translated state name and description
        const stateName = window.i18n ? window.i18n.t(`app.fundDetail.colony.states.${colony.state}.name`) : colony.state;
        const stateDesc = window.i18n ? window.i18n.t(`app.fundDetail.colony.states.${colony.state}.description`) : '';
        
        container.style.display = 'flex';
        container.innerHTML = `
            <div class="colony-mini-display" title="${stateDesc}">
                ${renderColonyVisual(colony.state, 40)}
                <span class="colony-state-label">${stateName}</span>
            </div>
        `;
        // console.log('[Colony] Display updated with state:', colony.state);
    } else {
        console.error('[Colony] Display container not found!');
    }
}

/**
 * Check and show weekly chest on group load
 * Chests are available 7 days after the last claim (not tied to Mondays)
 */
async function checkWeeklyChest(groupId) {
    if (!COLONY_FEATURE_ENABLED) {
        // console.log('[Colony] Feature disabled');
        return;
    }
    
    // First check for welcome chest
    // console.log('[Colony] Checking for welcome chest:', groupId);
    const welcomeChest = await getWeeklyChest(groupId, 'welcome');
    
    if (welcomeChest && !welcomeChest.isOpened) {
        // console.log('[Colony] Showing welcome chest banner');
        showWeeklyChestBanner(groupId, { ...welcomeChest, weekId: 'welcome' });
        return; // Show welcome chest first, don't check for weekly chest yet
    }
    
    // Check if 7 days have passed since last claim
    const colonyData = await getColonyData(groupId);
    const lastChestClaimed = colonyData?.lastChestClaimed || 0;
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const cooldownPassed = (now - lastChestClaimed) >= sevenDaysMs;
    
    // console.log('[Colony] Chest cooldown check:', { 
        lastChestClaimed: lastChestClaimed ? new Date(lastChestClaimed).toISOString() : 'never',
        cooldownPassed,
        timeRemaining: cooldownPassed ? 0 : Math.ceil((sevenDaysMs - (now - lastChestClaimed)) / (1000 * 60 * 60)) + 'h'
    });
    
    if (!cooldownPassed) {
        // console.log('[Colony] Chest cooldown not passed, waiting for 7 days since last claim');
        return;
    }
    
    // Use a unique chest ID based on when the cooldown period started
    // This ensures each chest is unique and can only be claimed once per cooldown period
    const weekId = getCurrentWeekId();
    // console.log('[Colony] Checking for weekly chest:', { groupId, weekId });
    
    let chest = await getWeeklyChest(groupId, weekId);
    // console.log('[Colony] Chest data:', chest);
    
    // If no chest exists for current week, try to create one automatically
    if (!chest) {
        // console.log('[Colony] No chest found, attempting auto-creation...');
        try {
            // Call the manual evaluation function (works on free plan)
            const evaluateFunction = firebase.functions().httpsCallable('evaluateWeeklyChestsManual');
            const result = await evaluateFunction({ weekId });
            
            if (result.data.success && result.data.chestsCreated > 0) {
                // console.log('[Colony] ✅ Auto-created weekly chest');
                // Reload chest data
                chest = await getWeeklyChest(groupId, weekId);
            } else {
                // console.log('[Colony] No chest created (group may not meet activity criteria)');
            }
        } catch (error) {
            console.error('[Colony] Error auto-creating chest:', error);
        }
    }
    
    // Check if chest exists and is not opened
    if (chest && !chest.isOpened) {
        // console.log('[Colony] Showing weekly chest banner');
        showWeeklyChestBanner(groupId, { ...chest, weekId });
    } else if (chest && chest.isOpened) {
        // console.log('[Colony] Chest already opened');
    } else {
        // console.log('[Colony] No chest available for this period');
    }
}

// Export for use in app
window.ColonySystem = {
    getColonyData,
    getWeeklyChest,
    getCurrentWeekId,
    openWeeklyChest,
    renderColonyVisual,
    showWeeklyChestBanner,
    updateColonyDisplay,
    checkWeeklyChest,
    openChestModal,
    closeChestModal,
    COLONY_STATES,
    COLONY_FEATURE_ENABLED,
    
    // Testing & Admin Functions
    async triggerWeeklyEvaluation(forceRecreate = false) {
        if (!firebase.auth().currentUser) {
            console.error('❌ Must be authenticated to trigger evaluation');
            return;
        }
        
        try {
            console.log('🐜 Triggering manual weekly chest evaluation...');
            const evaluateFunction = firebase.functions().httpsCallable('evaluateWeeklyChestsManual');
            const result = await evaluateFunction({ forceRecreate });
            console.log('✅ Evaluation complete:', result.data);
            return result.data;
        } catch (error) {
            console.error('❌ Error triggering evaluation:', error);
            throw error;
        }
    },
    
    async createTestChest(groupId, state = 'active', options = {}) {
        if (!firebase.database) {
            console.error('❌ Firebase not initialized');
            return;
        }
        
        // Options: weekOffset (número negativo para semanas pasadas), customWeekId
        const weekId = options.customWeekId || getCurrentWeekId(options.weekOffset || 0);
        
        const stateDescriptions = {
            forming: 'Tu colonia está naciendo. Las primeras hormigas exploran el terreno.',
            active: 'Las hormigas trabajan juntas. La colonia muestra signos de organización.',
            stable: 'Una comunidad organizada. Los túneles se expanden con propósito.',
            consolidated: '¡Un imperio de cooperación! La colonia ha alcanzado su máximo esplendor.'
        };
        
        const testChest = {
            state: state,
            description: stateDescriptions[state] || stateDescriptions.active,
            createdAt: Date.now(),
            isOpened: false,
            weeklyExpenses: options.expenses || 5,
            activeMembers: options.members || 3,
            consecutiveWeeks: state === 'forming' ? 1 : state === 'active' ? 5 : state === 'stable' ? 10 : 20
        };
        
        try {
            await firebase.database().ref(`weeklyChests/${groupId}/${weekId}`).set(testChest);
            console.log(`✅ Test chest created for ${groupId}`);
            console.log(`   State: ${state}`);
            console.log(`   Week ID: ${weekId}`);
            console.log(`   Expenses: ${testChest.weeklyExpenses}, Members: ${testChest.activeMembers}`);
            console.log(`💡 Reload the page to see the banner!`);
            return { ...testChest, weekId };
        } catch (error) {
            console.error('❌ Error creating test chest:', error);
            throw error;
        }
    },
    
    /**
     * Create multiple test chests for different weeks (testing history)
     * Usage: createTestChestHistory('groupId', 4) // Creates 4 chests (last 4 weeks)
     */
    async createTestChestHistory(groupId, numberOfWeeks = 3, startingState = 'forming') {
        if (!firebase.database) {
            console.error('❌ Firebase not initialized');
            return;
        }
        
        const states = ['forming', 'active', 'stable', 'consolidated'];
        const results = [];
        
        console.log(`🎁 Creating ${numberOfWeeks} test chests for group: ${groupId}`);
        
        for (let i = numberOfWeeks - 1; i >= 0; i--) {
            const weekOffset = -i; // Negative for past weeks
            const stateIndex = Math.min(numberOfWeeks - 1 - i, states.length - 1);
            const state = states[stateIndex];
            
            try {
                const result = await this.createTestChest(groupId, state, { weekOffset });
                results.push(result);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error(`❌ Error creating chest for week offset ${weekOffset}:`, error);
            }
        }
        
        console.log(`✅ Created ${results.length} test chests`);
        console.log(`💡 Reload the page to see the latest banner!`);
        return results;
    },
    
    /**
     * Quick test: Create chest for current week
     * Usage: quickTestChest('groupId') or quickTestChest('groupId', 'stable')
     */
    async quickTestChest(groupId, state = 'active') {
        console.log(`🚀 Quick Test: Creating chest for current week...`);
        const result = await this.createTestChest(groupId, state);
        
        // Auto-check for banner
        setTimeout(() => {
            console.log(`🔍 Checking for banner...`);
            this.checkWeeklyChest(groupId);
        }, 500);
        
        return result;
    },
    
    async deleteTestChest(groupId, weekId = null) {
        if (!firebase.database) {
            console.error('❌ Firebase not initialized');
            return;
        }
        
        const targetWeekId = weekId || getCurrentWeekId();
        
        try {
            await firebase.database().ref(`weeklyChests/${groupId}/${targetWeekId}`).remove();
            console.log(`✅ Chest deleted for ${groupId}, week ${targetWeekId}`);
            console.log(`💡 Reload the page to clear the banner!`);
        } catch (error) {
            console.error('❌ Error deleting chest:', error);
            throw error;
        }
    }
};

// Colony System initialized
// Testing functions: triggerWeeklyEvaluation(), createTestChest(), deleteTestChest()

