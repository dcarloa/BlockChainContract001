// ============================================
// COLONIA VIVA SYSTEM - Ant Pool
// ============================================
// Sistema de visualización de organización grupal
// NO afecta balances ni lógica financiera

const COLONY_STATES = {
    forming: {
        name: 'Formando caminos',
        visual: {
            ant: 'simple',
            paths: 'scattered',
            base: 'basic',
            ambient: 'dim'
        },
        description: 'Tu grupo está empezando a organizarse'
    },
    active: {
        name: 'Colonia activa',
        visual: {
            ant: 'moving',
            paths: 'connected',
            base: 'structured',
            ambient: 'warm'
        },
        description: 'Tu grupo mantiene claridad en los gastos'
    },
    stable: {
        name: 'Orden establecido',
        visual: {
            ant: 'coordinated',
            paths: 'organized',
            base: 'solid',
            ambient: 'bright'
        },
        description: 'Tu grupo tiene hábitos claros'
    },
    consolidated: {
        name: 'Colonia consolidada',
        visual: {
            ant: 'efficient',
            paths: 'optimized',
            base: 'advanced',
            ambient: 'radiant'
        },
        description: 'Tu grupo es ejemplo de organización'
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
        await db.ref(`weeklyChests/${groupId}/${weekId}`).update({
            isOpened: true,
            openedBy: user.uid,
            openedAt: Date.now()
        });
        
        console.log('[Colony] Chest marked as opened in Firebase');
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
    if (!config) return '';
    
    const colors = {
        forming: { primary: '#94a3b8', secondary: '#cbd5e1', glow: '#e2e8f0' },
        active: { primary: '#667eea', secondary: '#764ba2', glow: '#a78bfa' },
        stable: { primary: '#10b981', secondary: '#059669', glow: '#6ee7b7' },
        consolidated: { primary: '#f59e0b', secondary: '#d97706', glow: '#fbbf24' }
    };
    
    const c = colors[state];
    
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="colony-visual">
            <!-- Ambient glow -->
            <defs>
                <radialGradient id="glow-${state}">
                    <stop offset="0%" style="stop-color:${c.glow};stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:${c.glow};stop-opacity:0" />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#glow-${state})" />
            
            <!-- Base structure -->
            <circle cx="50" cy="50" r="30" fill="none" stroke="${c.primary}" stroke-width="2" opacity="0.3" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="${c.primary}" stroke-width="2" opacity="0.5" />
            
            <!-- Paths (connecting lines) -->
            ${state !== 'forming' ? `
                <line x1="30" y1="30" x2="50" y2="50" stroke="${c.secondary}" stroke-width="1.5" opacity="0.6" />
                <line x1="70" y1="30" x2="50" y2="50" stroke="${c.secondary}" stroke-width="1.5" opacity="0.6" />
                <line x1="30" y1="70" x2="50" y2="50" stroke="${c.secondary}" stroke-width="1.5" opacity="0.6" />
                <line x1="70" y1="70" x2="50" y2="50" stroke="${c.secondary}" stroke-width="1.5" opacity="0.6" />
            ` : ''}
            
            <!-- Ant symbol (center) -->
            <circle cx="50" cy="50" r="8" fill="${c.primary}" />
            <circle cx="45" cy="45" r="3" fill="${c.secondary}" />
            <circle cx="55" cy="45" r="3" fill="${c.secondary}" />
            <ellipse cx="50" cy="55" rx="6" ry="4" fill="${c.primary}" opacity="0.7" />
        </svg>
    `;
}

/**
 * Show weekly chest banner in group view
 */
function showWeeklyChestBanner(groupId, chest) {
    if (!COLONY_FEATURE_ENABLED || !chest) {
        console.log('[Colony] Banner not shown:', { enabled: COLONY_FEATURE_ENABLED, chest });
        return;
    }
    
    // Remove existing banner if any
    const existingBanner = document.getElementById('weeklyChestBanner');
    if (existingBanner) {
        existingBanner.remove();
    }
    
    const banner = document.createElement('div');
    banner.id = 'weeklyChestBanner';
    banner.className = 'weekly-chest-banner';
    banner.innerHTML = `
        <div class="chest-banner-content">
            <span class="chest-icon">📦</span>
            <div class="chest-text">
                <strong>¡Cofre Semanal Disponible!</strong>
                <small>Tu colonia ha completado otra semana</small>
            </div>
            <button class="chest-banner-btn" onclick="ColonySystem.openChestModal('${groupId}', '${chest.weekId}')">
                Abrir Cofre
            </button>
        </div>
    `;
    
    // Insert banner in the dedicated container
    const container = document.getElementById('weeklyChestBannerContainer');
    if (container) {
        console.log('[Colony] Inserting banner into container');
        container.innerHTML = '';
        container.appendChild(banner);
    } else {
        console.error('[Colony] Banner container not found!');
    }
}

/**
 * Open chest modal
 */
async function openChestModal(groupId, weekId) {
    console.log('[Colony] Opening chest modal:', { groupId, weekId });
    
    const chest = await getWeeklyChest(groupId, weekId);
    if (!chest) {
        console.error('[Colony] Chest not found');
        return;
    }
    
    const colonyState = chest.state || 'active';
    const config = COLONY_STATES[colonyState];
    console.log('[Colony] Chest state:', colonyState);
    
    // Get random item from mascot system (if available)
    let rewardItem = null;
    if (window.MascotSystem) {
        const randomItem = window.MascotSystem.getRandomItemByColonyState(colonyState);
        rewardItem = await window.MascotSystem.addItemToWardrobe(groupId, randomItem.id);
        console.log('[Colony] Reward item:', rewardItem);
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'weeklyChestModal';
    modal.onclick = (e) => {
        if (e.target === modal) closeChestModal();
    };
    
    modal.innerHTML = `
        <div class="weekly-chest-modal" onclick="event.stopPropagation()">
            <button class="close-btn" id="closeChestBtnX">&times;</button>
            
            <div class="chest-modal-content">
                <h2 class="chest-modal-title">🎁 Cofre de la Colonia</h2>
                
                <div class="chest-visual-container">
                    ${renderColonyVisual(colonyState, 120)}
                </div>
                
                <div class="chest-state-info">
                    <h3>${config.name}</h3>
                    <p>${chest.description || 'Gracias por mantener todo claro esta semana.'}</p>
                </div>
                
                ${rewardItem ? `
                    <div class="chest-reward-section">
                        <h4>✨ ¡Recompensa Obtenida!</h4>
                        <div class="reward-item">
                            <div class="reward-emoji">${rewardItem.item.emoji}</div>
                            <div class="reward-info">
                                <p class="reward-name">${rewardItem.item.name}</p>
                                ${rewardItem.isNew ? '<span class="reward-badge new-badge">¡NUEVO!</span>' : ''}
                                ${rewardItem.upgraded ? `<span class="reward-badge upgrade-badge">¡Subió a ${window.MascotSystem.ITEM_LEVELS[rewardItem.newLevel].name}!</span>` : `<span class="reward-copies">${rewardItem.copies}/6 copias</span>`}
                            </div>
                        </div>
                        <p class="reward-hint">Visita la pestaña "Mascota" para equipar tus prendas</p>
                    </div>
                ` : ''}
                
                <div class="chest-description">
                    <p>${config.description}</p>
                </div>
                
                <button class="btn btn-primary btn-block chest-close-btn" id="closeChestBtn">
                    Seguir usando Ant Pool
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('[Colony] Modal appended to body');
    
    // Attach event listeners to both close buttons
    const closeBtn = document.getElementById('closeChestBtn');
    const closeBtnX = document.getElementById('closeChestBtnX');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeChestModal);
    }
    if (closeBtnX) {
        closeBtnX.addEventListener('click', closeChestModal);
    }
    
    // Reload mascot tab if it's currently active to show new items
    const mascotTab = document.getElementById('mascotTab');
    if (mascotTab && mascotTab.classList.contains('active') && groupId) {
        setTimeout(() => {
            if (window.MascotSystem) {
                console.log('[Colony] Reloading mascot tab after chest opening');
                window.MascotSystem.loadMascotTab(groupId);
            }
        }, 500);
    }
    
    // Mark as opened
    await openWeeklyChest(groupId, weekId);
    console.log('[Colony] Chest marked as opened');
    
    // Update mascot header and tab if available
    if (window.MascotSystem) {
        await window.MascotSystem.updateMascotHeader(groupId);
        
        // Reload mascot tab if it's currently active
        const mascotTab = document.getElementById('mascotTab');
        if (mascotTab && mascotTab.classList.contains('active')) {
            await window.MascotSystem.loadMascotTab(groupId);
            console.log('[Colony] Mascot tab reloaded with new item');
        }
    }
    
    // Remove banner after opening
    const banner = document.getElementById('weeklyChestBanner');
    if (banner) {
        banner.remove();
        console.log('[Colony] Banner removed');
    }
}

/**
 * Close chest modal
 */
function closeChestModal() {
    const modal = document.getElementById('weeklyChestModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * Update colony display in group header
 */
async function updateColonyDisplay(groupId) {
    if (!COLONY_FEATURE_ENABLED) {
        console.log('[Colony] Feature disabled for display');
        return;
    }
    
    const colony = await getColonyData(groupId);
    console.log('[Colony] Colony data for display:', colony);
    
    if (!colony) {
        console.log('[Colony] No colony data available');
        return;
    }
    
    const config = COLONY_STATES[colony.state];
    const container = document.getElementById('colonyDisplayContainer');
    
    if (container) {
        container.style.display = 'flex';
        container.innerHTML = `
            <div class="colony-mini-display" title="${config.description}">
                ${renderColonyVisual(colony.state, 40)}
                <span class="colony-state-label">${config.name}</span>
            </div>
        `;
        console.log('[Colony] Display updated with state:', colony.state);
    } else {
        console.error('[Colony] Display container not found!');
    }
}

/**
 * Check and show weekly chest on group load
 */
async function checkWeeklyChest(groupId) {
    if (!COLONY_FEATURE_ENABLED) {
        console.log('[Colony] Feature disabled');
        return;
    }
    
    const weekId = getCurrentWeekId();
    console.log('[Colony] Checking for chest:', { groupId, weekId });
    
    const chest = await getWeeklyChest(groupId, weekId);
    console.log('[Colony] Chest data:', chest);
    
    // Check if chest exists and is not opened
    if (chest && !chest.isOpened) {
        console.log('[Colony] Showing weekly chest banner');
        showWeeklyChestBanner(groupId, { ...chest, weekId });
    } else if (chest && chest.isOpened) {
        console.log('[Colony] Chest already opened');
    } else {
        console.log('[Colony] No chest available for this week');
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

console.log('✅ Colony System initialized');
console.log('💡 Testing functions available:');
console.log('   - ColonySystem.triggerWeeklyEvaluation() - Trigger manual evaluation');
console.log('   - ColonySystem.createTestChest(groupId, state) - Create test chest');
console.log('   - ColonySystem.deleteTestChest(groupId) - Delete current week chest');

