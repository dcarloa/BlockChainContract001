// ============================================
// MASCOT SYSTEM - Ant Pool
// ============================================
// Sistema simplificado de mascota para retención de usuarios
// NO afecta funcionalidad principal de división de gastos

// Feature flag
const MASCOT_FEATURE_ENABLED = true;

// ============================================
// WARDROBE CATALOG
// ============================================

const WARDROBE_ITEMS = {
    // CABEZA (6 items)
    hat_explorer: {
        id: 'hat_explorer',
        name: 'Sombrero Explorador',
        emoji: '🎩',
        category: 'head',
        rarity: 'common',
        description: 'Perfecto para aventuras'
    },
    crown_gold: {
        id: 'crown_gold',
        name: 'Corona Dorada',
        emoji: '👑',
        category: 'head',
        rarity: 'rare',
        description: 'Para la realeza del grupo'
    },
    cap_casual: {
        id: 'cap_casual',
        name: 'Gorra Casual',
        emoji: '🧢',
        category: 'head',
        rarity: 'common',
        description: 'Estilo relajado'
    },
    cap_graduate: {
        id: 'cap_graduate',
        name: 'Gorro Graduado',
        emoji: '🎓',
        category: 'head',
        rarity: 'common',
        description: 'Inteligencia grupal'
    },
    helmet_adventure: {
        id: 'helmet_adventure',
        name: 'Casco Aventurero',
        emoji: '⛑️',
        category: 'head',
        rarity: 'rare',
        description: 'Seguridad primero'
    },
    crown_flower: {
        id: 'crown_flower',
        name: 'Corona Floral',
        emoji: '🌺',
        category: 'head',
        rarity: 'rare',
        description: 'Belleza natural'
    },
    
    // ACCESORIOS (6 items)
    backpack: {
        id: 'backpack',
        name: 'Mochila Viajera',
        emoji: '🎒',
        category: 'accessory',
        rarity: 'common',
        description: 'Lista para el viaje'
    },
    wings: {
        id: 'wings',
        name: 'Alas Brillantes',
        emoji: '🪽',
        category: 'accessory',
        rarity: 'rare',
        description: 'Vuela alto'
    },
    pickaxe: {
        id: 'pickaxe',
        name: 'Pico Minero',
        emoji: '⛏️',
        category: 'accessory',
        rarity: 'common',
        description: 'Excava tesoros'
    },
    guitar: {
        id: 'guitar',
        name: 'Guitarra',
        emoji: '🎸',
        category: 'accessory',
        rarity: 'rare',
        description: 'Música grupal'
    },
    tablet: {
        id: 'tablet',
        name: 'Tablet',
        emoji: '📱',
        category: 'accessory',
        rarity: 'common',
        description: 'Tecnología moderna'
    },
    star_magic: {
        id: 'star_magic',
        name: 'Estrella Mágica',
        emoji: '🌟',
        category: 'accessory',
        rarity: 'rare',
        description: 'Brillo especial'
    },
    
    // VESTIMENTA / OUTFIT (6 items)
    cape_hero: {
        id: 'cape_hero',
        name: 'Capa de Héroe',
        emoji: '🦸',
        category: 'outfit',
        rarity: 'rare',
        description: 'Para los héroes del grupo'
    },
    scarf_cozy: {
        id: 'scarf_cozy',
        name: 'Bufanda Acogedora',
        emoji: '🧣',
        category: 'outfit',
        rarity: 'common',
        description: 'Calidez compartida'
    },
    vest_safety: {
        id: 'vest_safety',
        name: 'Chaleco de Seguridad',
        emoji: '🦺',
        category: 'outfit',
        rarity: 'common',
        description: 'Siempre visible'
    },
    coat_lab: {
        id: 'coat_lab',
        name: 'Bata de Laboratorio',
        emoji: '🥼',
        category: 'outfit',
        rarity: 'rare',
        description: 'Científico del ahorro'
    },
    shirt_tie: {
        id: 'shirt_tie',
        name: 'Camisa con Corbata',
        emoji: '👔',
        category: 'outfit',
        rarity: 'common',
        description: 'Profesional y elegante'
    },
    kimono_traditional: {
        id: 'kimono_traditional',
        name: 'Kimono Tradicional',
        emoji: '👘',
        category: 'outfit',
        rarity: 'rare',
        description: 'Elegancia oriental'
    }
};

// Item levels - 5 copies for Silver, 15 for Gold
const ITEM_LEVELS = {
    basic: { name: 'Básico', stars: '⭐', copies: 1, color: '#9ca3af', effect: '' },
    silver: { name: 'Plata', stars: '⭐⭐✨', copies: 5, color: '#c0c0c0', effect: 'silver-shine' },
    gold: { name: 'Oro', stars: '⭐⭐⭐✨✨', copies: 15, color: '#ffd700', effect: 'gold-shine' }
};

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Get mascot data for a group
 */
async function getMascotData(groupId) {
    if (!MASCOT_FEATURE_ENABLED) return null;
    
    try {
        const db = firebase.database();
        const snapshot = await db.ref(`groups/${groupId}/mascot`).once('value');
        const data = snapshot.val();
        
        // Default mascot if not exists
        if (!data) {
            return {
                equipped: {
                    head: null,
                    accessory: null
                },
                wardrobe: {}
            };
        }
        
        return data;
    } catch (error) {
        console.error('[Mascot] Error getting data:', error);
        return null;
    }
}

/**
 * Get item level based on copies
 */
function getItemLevel(copies) {
    if (copies >= 10) return 'gold';
    if (copies >= 5) return 'silver';
    return 'basic';
}

/**
 * Render mascot preview with equipped items
 */
function renderMascotPreview(mascotData, size = 'normal') {
    const equipped = mascotData?.equipped || {};
    const wardrobe = mascotData?.wardrobe || {};
    
    const headItem = equipped.head ? WARDROBE_ITEMS[equipped.head] : null;
    const outfitItem = equipped.outfit ? WARDROBE_ITEMS[equipped.outfit] : null;
    const accessoryItem = equipped.accessory ? WARDROBE_ITEMS[equipped.accessory] : null;
    
    const sizeClass = size === 'small' ? 'mascot-preview-small' : 'mascot-preview';
    
    return `
        <div class="${sizeClass}">
            ${headItem ? `<div class="mascot-item-head">${headItem.emoji}</div>` : ''}
            <div class="mascot-body">🐜</div>
            ${outfitItem ? `<div class="mascot-item-outfit">${outfitItem.emoji}</div>` : ''}
            ${accessoryItem ? `<div class="mascot-item-accessory">${accessoryItem.emoji}</div>` : ''}
        </div>
    `;
}

/**
 * Equip item to mascot
 */
async function equipItem(groupId, itemId) {
    if (!MASCOT_FEATURE_ENABLED) return false;
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) return false;
        
        const item = WARDROBE_ITEMS[itemId];
        if (!item) return false;
        
        const db = firebase.database();
        
        // Check if user is member
        const memberSnapshot = await db.ref(`groups/${groupId}/members/${user.uid}`).once('value');
        if (!memberSnapshot.exists()) {
            console.error('[Mascot] User not a member');
            return false;
        }
        
        // Equip item in correct slot
        await db.ref(`groups/${groupId}/mascot/equipped/${item.category}`).set(itemId);
        
        console.log(`[Mascot] Equipped ${itemId} to ${item.category}`);
        return true;
    } catch (error) {
        console.error('[Mascot] Error equipping item:', error);
        return false;
    }
}

/**
 * Unequip item from slot
 */
async function unequipItem(groupId, category) {
    if (!MASCOT_FEATURE_ENABLED) return false;
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) return false;
        
        const db = firebase.database();
        
        // Check if user is member
        const memberSnapshot = await db.ref(`groups/${groupId}/members/${user.uid}`).once('value');
        if (!memberSnapshot.exists()) {
            console.error('[Mascot] User not a member');
            return false;
        }
        
        // Remove item from slot
        await db.ref(`groups/${groupId}/mascot/equipped/${category}`).remove();
        
        console.log(`[Mascot] Unequipped ${category} slot`);
        return true;
    } catch (error) {
        console.error('[Mascot] Error unequipping item:', error);
        return false;
    }
}

/**
 * Add item to wardrobe (from chest reward)
 */
async function addItemToWardrobe(groupId, itemId) {
    if (!MASCOT_FEATURE_ENABLED) return null;
    
    try {
        const db = firebase.database();
        const itemRef = db.ref(`groups/${groupId}/mascot/wardrobe/${itemId}`);
        const snapshot = await itemRef.once('value');
        const current = snapshot.val() || { copies: 0, level: 'basic' };
        
        const newCopies = current.copies + 1;
        const newLevel = getItemLevel(newCopies);
        const upgraded = newLevel !== current.level;
        
        await itemRef.set({
            copies: newCopies,
            level: newLevel,
            lastObtained: Date.now()
        });
        
        console.log(`[Mascot] Added ${itemId}, copies: ${newCopies}, level: ${newLevel}`);
        
        return {
            itemId,
            item: WARDROBE_ITEMS[itemId],
            isNew: current.copies === 0,
            upgraded,
            oldLevel: current.level,
            newLevel,
            copies: newCopies
        };
    } catch (error) {
        console.error('[Mascot] Error adding item:', error);
        return null;
    }
}

/**
 * Get random item based on colony state
 */
function getRandomItemByColonyState(colonyState) {
    const allItems = Object.values(WARDROBE_ITEMS);
    
    // Filter by rarity based on colony state
    let availableItems;
    switch (colonyState) {
        case 'forming':
            // Only common items
            availableItems = allItems.filter(i => i.rarity === 'common');
            break;
        case 'active':
            // 70% common, 30% rare
            availableItems = Math.random() < 0.7
                ? allItems.filter(i => i.rarity === 'common')
                : allItems.filter(i => i.rarity === 'rare');
            break;
        case 'stable':
            // 40% common, 60% rare
            availableItems = Math.random() < 0.4
                ? allItems.filter(i => i.rarity === 'common')
                : allItems.filter(i => i.rarity === 'rare');
            break;
        case 'consolidated':
            // All items available
            availableItems = allItems;
            break;
        default:
            availableItems = allItems;
    }
    
    // Return random item from available
    return availableItems[Math.floor(Math.random() * availableItems.length)];
}

/**
 * Create a welcome chest for newly created groups
 * This gives the first item to help users understand the mascot system
 */
async function createWelcomeChest(groupId) {
    if (!MASCOT_FEATURE_ENABLED) return null;
    
    try {
        const db = firebase.database();
        const weekId = 'welcome'; // Special week ID for welcome chest
        const chestRef = db.ref(`groups/${groupId}/weeklyChests/${weekId}`);
        
        // Check if welcome chest already exists
        const existingChest = await chestRef.once('value');
        if (existingChest.exists()) {
            console.log('[Mascot] Welcome chest already exists');
            return null;
        }
        
        // Select a random common item for the welcome chest
        const commonItems = Object.values(WARDROBE_ITEMS).filter(i => i.rarity === 'common');
        const welcomeItem = commonItems[Math.floor(Math.random() * commonItems.length)];
        
        // Create the welcome chest
        const chest = {
            weekId: weekId,
            colonyState: 'forming',
            isOpened: false,
            createdAt: Date.now(),
            reward: {
                itemId: welcomeItem.id,
                item: {
                    name: welcomeItem.name,
                    emoji: welcomeItem.emoji,
                    category: welcomeItem.category,
                    rarity: welcomeItem.rarity
                }
            },
            isWelcomeChest: true
        };
        
        await chestRef.set(chest);
        
        console.log(`[Mascot] Welcome chest created with item: ${welcomeItem.name}`);
        
        return chest;
        
    } catch (error) {
        console.error('[Mascot] Error creating welcome chest:', error);
        return null;
    }
}

/**
 * Render weekly chest status section
 */
async function renderWeeklyChestStatus(groupId) {
    try {
        // Check if ColonySystem is available
        if (typeof ColonySystem === 'undefined' || !ColonySystem.getWeeklyChest) {
            console.warn('[Mascot] ColonySystem not available');
            return `
                <div class="weekly-chest-section">
                    <div class="chest-icon-container">
                        <div class="chest-icon">📦</div>
                    </div>
                    <h4>🎁 Weekly Chests</h4>
                    <p class="chest-hint">Chest system loading...</p>
                </div>
            `;
        }
        
        // First check for welcome chest (priority)
        const welcomeChest = await ColonySystem.getWeeklyChest(groupId, 'welcome');
        
        // Determine which chest to show
        let chestData = null;
        let currentWeekId = 'welcome';
        
        if (welcomeChest && !welcomeChest.isOpened) {
            // Show welcome chest if available and not opened
            chestData = welcomeChest;
            currentWeekId = 'welcome';
        } else {
            // Otherwise check current week's chest
            currentWeekId = ColonySystem.getCurrentWeekId() || 'unknown';
            chestData = await ColonySystem.getWeeklyChest(groupId, currentWeekId);
        }
        
        // If no chest exists yet, check for last claimed chest to calculate countdown
        if (!chestData) {
            const now = Date.now();
            
            // Try to find the last opened chest to calculate when next one is available
            let lastOpenedAt = null;
            try {
                // Check if there's a lastChestClaimed timestamp in colony data or check previous chests
                const colonyData = await ColonySystem.getColonyData(groupId);
                lastOpenedAt = colonyData?.lastChestClaimed || null;
            } catch (e) {
                console.log('[Mascot] Could not get last chest claim time');
            }
            
            // If we have a last claim time, calculate from there; otherwise show "available now"
            if (lastOpenedAt) {
                const nextChestTime = lastOpenedAt + (7 * 24 * 60 * 60 * 1000); // 7 days after last claim
                const timeUntilNextChest = Math.max(0, nextChestTime - now);
                
                if (timeUntilNextChest > 0) {
                    const daysLeft = Math.floor(timeUntilNextChest / (24 * 60 * 60 * 1000));
                    const hoursLeft = Math.floor((timeUntilNextChest % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                    
                    const elapsedTime = now - lastOpenedAt;
                    const totalWaitTime = 7 * 24 * 60 * 60 * 1000;
                    const progress = Math.max(0, Math.min(100, (elapsedTime / totalWaitTime) * 100));
                    
                    const nextChestDate = new Date(nextChestTime);
                    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
                    const nextDateStr = nextChestDate.toLocaleDateString('en-US', dateOptions);
                    
                    return `
                        <div class="weekly-chest-section chest-pending">
                            <div class="chest-pulse-container">
                                <div class="chest-icon-container locked animate-pulse">
                                    <div class="chest-icon">📦</div>
                                    <div class="chest-lock">⏳</div>
                                </div>
                                <div class="pulse-ring"></div>
                                <div class="pulse-ring delay-1"></div>
                                <div class="pulse-ring delay-2"></div>
                            </div>
                            <h4>🔒 Next Chest</h4>
                            <p class="chest-timer">Available in: <strong>${daysLeft}d ${hoursLeft}h</strong></p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <p class="chest-hint" style="font-size: 0.85rem; color: #888;">📅 Available on ${nextDateStr}</p>
                            <p class="chest-hint">💡 Chests unlock 7 days after your last claim!</p>
                        </div>
                    `;
                }
            }
            
            // No last claim or cooldown has passed - chest should be available soon
            return `
                <div class="weekly-chest-section chest-pending">
                    <div class="chest-pulse-container">
                        <div class="chest-icon-container locked animate-pulse">
                            <div class="chest-icon">📦</div>
                            <div class="chest-lock">✨</div>
                        </div>
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring delay-1"></div>
                    </div>
                    <h4>📦 Chest Available Soon</h4>
                    <p class="chest-timer">Keep your group active to unlock rewards!</p>
                    <p class="chest-hint">💡 Add expenses or activities to generate your chest</p>
                </div>
            `;
        }
        
        const now = Date.now();
        const isPending = chestData.state === 'pending';
        // Check for various truthy values of isOpened
        const isOpened = chestData.isOpened === true || chestData.isOpened === 'true' || (typeof chestData.isOpened === 'number' && chestData.isOpened > 0);
        const isAvailable = !isOpened && !isPending;
        const isWelcomeChest = currentWeekId === 'welcome' || chestData.isWelcomeChest;
        
        if (isPending) {
            const unlockTime = chestData.unlockTime || (now + 24 * 60 * 60 * 1000); // Default to 24h if missing
            const hoursLeft = Math.max(0, Math.ceil((unlockTime - now) / (60 * 60 * 1000)));
            const daysLeft = Math.floor(hoursLeft / 24);
            const remainingHours = hoursLeft % 24;
            
            return `
                <div class="weekly-chest-section chest-pending">
                    <div class="chest-pulse-container">
                        <div class="chest-icon-container locked animate-pulse">
                            <div class="chest-icon">🎁</div>
                            <div class="chest-lock">⏳</div>
                        </div>
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring delay-1"></div>
                        <div class="pulse-ring delay-2"></div>
                    </div>
                    <h4>🔒 Chest Locked</h4>
                    <p class="chest-timer">Unlocks in: <strong>${daysLeft > 0 ? `${daysLeft}d ` : ''}${remainingHours}h</strong></p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, ((now - (chestData.createdAt || now)) / ((unlockTime) - (chestData.createdAt || now))) * 100)}%"></div>
                    </div>
                    <p class="chest-hint">💡 Keep your group active for better rewards!</p>
                </div>
            `;
        }
        
        if (isAvailable) {
            const chestTitle = isWelcomeChest ? '🎁 Welcome Chest Ready!' : '🎉 Chest Ready to Open!';
            const chestSubtitle = isWelcomeChest ? 'Your welcome gift is waiting!' : 'Your weekly reward is waiting';
            const colonyState = chestData.state || 'active';
            
            return `
                <div class="weekly-chest-section chest-available">
                    <div class="chest-glow-container">
                        <div class="chest-icon-container available animate-bounce">
                            <div class="chest-icon">✨🎁✨</div>
                        </div>
                        <div class="glow-effect"></div>
                        <div class="sparkles">
                            <span>✨</span>
                            <span>⭐</span>
                            <span>💫</span>
                            <span>✨</span>
                        </div>
                    </div>
                    <h4 class="chest-ready">${chestTitle}</h4>
                    <p>${chestSubtitle}</p>
                    <button class="btn btn-primary btn-open-chest" onclick="ColonySystem.openChestModal('${groupId}', '${currentWeekId}')">
                        Open Chest
                    </button>
                    ${!isWelcomeChest ? `<p class="chest-hint" style="font-size: 0.85rem; margin-top: 0.5rem;">🐜 Colony state: <strong>${colonyState}</strong></p>` : ''}
                </div>
            `;
        }
        
        if (isOpened) {
            const claimedItem = chestData.content?.item;
            const itemData = claimedItem ? WARDROBE_ITEMS[claimedItem] : null;
            
            // Calculate time until next chest (7 days from openedAt)
            const nowTime = Date.now();
            const openedAt = chestData.openedAt || nowTime;
            const nextChestTime = openedAt + (7 * 24 * 60 * 60 * 1000); // 7 days after claim
            
            const timeUntilNextChest = Math.max(0, nextChestTime - nowTime);
            const daysLeft = Math.floor(timeUntilNextChest / (24 * 60 * 60 * 1000));
            const hoursLeft = Math.floor((timeUntilNextChest % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            
            // Calculate progress (how much time has passed since claim)
            const totalWaitTime = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
            const elapsedTime = nowTime - openedAt;
            const weekProgress = Math.max(0, Math.min(100, (elapsedTime / totalWaitTime) * 100));
            
            // Format the next available date
            const nextChestDate = new Date(nextChestTime);
            const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
            const nextDateStr = nextChestDate.toLocaleDateString('en-US', dateOptions);
            
            return `
                <div class="weekly-chest-section chest-claimed">
                    <div class="chest-pulse-container">
                        <div class="chest-icon-container claimed animate-pulse">
                            <div class="chest-icon">✅</div>
                        </div>
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring delay-1"></div>
                    </div>
                    <h4>🎉 Chest Claimed!</h4>
                    ${itemData ? `<p>You received: ${itemData.emoji} <strong>${itemData.name}</strong></p>` : ''}
                    <p class="chest-timer">Next chest in: <strong>${daysLeft}d ${hoursLeft}h</strong></p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${weekProgress}%"></div>
                    </div>
                    <p class="chest-hint" style="font-size: 0.85rem; color: #888;">📅 Available on ${nextDateStr}</p>
                </div>
            `;
        }
        
        // Fallback: if chest exists but is in an unexpected state
        return `
            <div class="weekly-chest-section">
                <div class="chest-icon-container">
                    <div class="chest-icon">📦</div>
                </div>
                <h4>Weekly Chest</h4>
                <p class="chest-hint">Loading chest status...</p>
            </div>
        `;
        
    } catch (error) {
        console.error('[Mascot] Error rendering chest status:', error);
        return '<div class="weekly-chest-section"><p>Error loading chest status</p></div>';
    }
}

/**
 * Load mascot tab content
 */
async function loadMascotTab(groupId) {
    if (!MASCOT_FEATURE_ENABLED) return;
    
    const container = document.getElementById('mascotTab');
    if (!container) {
        console.error('[Mascot] Tab container not found!');
        return;
    }
    
    console.log('[Mascot] Loading tab for group:', groupId);
    
    try {
        const mascotData = await getMascotData(groupId);
        console.log('[Mascot] Data loaded:', mascotData);
        
        const wardrobe = mascotData?.wardrobe || {};
        const equipped = mascotData?.equipped || {};
        
        const totalItems = Object.keys(wardrobe).length;
        console.log('[Mascot] Total items in wardrobe:', totalItems);
        console.log('[Mascot] Wardrobe contents:', wardrobe);
        
        const headItems = Object.values(WARDROBE_ITEMS).filter(i => i.category === 'head');
        const outfitItems = Object.values(WARDROBE_ITEMS).filter(i => i.category === 'outfit');
        const accessoryItems = Object.values(WARDROBE_ITEMS).filter(i => i.category === 'accessory');
        
        // Render weekly chest status
        const chestHTML = await renderWeeklyChestStatus(groupId);
        
        container.innerHTML = `
            <div class="mascot-tab-content">
                <div class="mascot-header">
                    <h3>🐜 <span data-i18n="app.fundDetail.mascot.title">Hormiga del Grupo</span></h3>
                    <p class="mascot-subtitle" data-i18n="app.fundDetail.mascot.subtitle">Colecciona prendas abriendo cofres semanales</p>
                </div>
                
                <div class="mascot-preview-container">
                    ${renderMascotPreview(mascotData, 'normal')}
                </div>
                
                <div class="mascot-equipped">
                    <h4 data-i18n="app.fundDetail.mascot.equipped">Equipado</h4>
                    <div class="equipped-slots">
                        <div class="equipped-slot" data-slot="head">
                            <div class="slot-label" data-i18n="app.fundDetail.mascot.head">Cabeza</div>
                            <div class="slot-item">
                                ${equipped.head 
                                    ? `<span class="item-emoji ${ITEM_LEVELS[wardrobe[equipped.head]?.level || 'basic'].effect}">${WARDROBE_ITEMS[equipped.head].emoji}</span>
                                       <span class="item-level">${ITEM_LEVELS[wardrobe[equipped.head]?.level || 'basic'].stars}</span>`
                                    : '<span class="slot-empty" data-i18n="app.fundDetail.mascot.empty">Vacío</span>'}
                            </div>
                        </div>
                        <div class="equipped-slot" data-slot="outfit">
                            <div class="slot-label" data-i18n="app.fundDetail.mascot.outfit">Vestimenta</div>
                            <div class="slot-item">
                                ${equipped.outfit 
                                    ? `<span class="item-emoji ${ITEM_LEVELS[wardrobe[equipped.outfit]?.level || 'basic'].effect}">${WARDROBE_ITEMS[equipped.outfit].emoji}</span>
                                       <span class="item-level">${ITEM_LEVELS[wardrobe[equipped.outfit]?.level || 'basic'].stars}</span>`
                                    : '<span class="slot-empty" data-i18n="app.fundDetail.mascot.empty">Vacío</span>'}
                            </div>
                        </div>
                        <div class="equipped-slot" data-slot="accessory">
                            <div class="slot-label" data-i18n="app.fundDetail.mascot.accessory">Accesorio</div>
                            <div class="slot-item">
                                ${equipped.accessory 
                                    ? `<span class="item-emoji ${ITEM_LEVELS[wardrobe[equipped.accessory]?.level || 'basic'].effect}">${WARDROBE_ITEMS[equipped.accessory].emoji}</span>
                                       <span class="item-level">${ITEM_LEVELS[wardrobe[equipped.accessory]?.level || 'basic'].stars}</span>`
                                    : '<span class="slot-empty" data-i18n="app.fundDetail.mascot.empty">Vacío</span>'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <details class="mascot-collection" open>
                    <summary>
                        <h4><span data-i18n="app.fundDetail.mascot.collection">Colección</span> (${totalItems}/18)</h4>
                    </summary>
                    <div class="collection-content">
                    
                    <div class="collection-category">
                        <h5>🎩 <span data-i18n="app.fundDetail.mascot.head">Cabeza</span></h5>
                        <div class="collection-items">
                            ${headItems.map(item => {
                                const owned = wardrobe[item.id];
                                const isEquipped = equipped.head === item.id;
                                const levelEffect = owned ? ITEM_LEVELS[owned.level].effect : '';
                                return `
                                    <div class="collection-item ${owned ? 'owned' : 'locked'} ${isEquipped ? 'equipped' : ''} ${levelEffect}" 
                                         data-item="${item.id}"
                                         onclick="${owned ? (isEquipped ? `MascotSystem.unequipItem('${groupId}', 'head')` : `MascotSystem.equipItem('${groupId}', '${item.id}')`) : ''}">
                                        <div class="item-emoji">${owned ? item.emoji : '❓'}</div>
                                        ${owned ? `
                                            <div class="item-level">${ITEM_LEVELS[owned.level].stars}</div>
                                            <div class="item-copies">${owned.copies}/10</div>
                                        ` : '<div class="item-locked" data-i18n="app.fundDetail.mascot.locked">Bloqueado</div>'}
                                        ${isEquipped ? '<div class="equipped-badge" title="Click to unequip">✓</div>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="collection-category">
                        <h5>👔 <span data-i18n="app.fundDetail.mascot.outfit">Vestimenta</span></h5>
                        <div class="collection-items">
                            ${outfitItems.map(item => {
                                const owned = wardrobe[item.id];
                                const isEquipped = equipped.outfit === item.id;
                                const levelEffect = owned ? ITEM_LEVELS[owned.level].effect : '';
                                return `
                                    <div class="collection-item ${owned ? 'owned' : 'locked'} ${isEquipped ? 'equipped' : ''} ${levelEffect}"
                                         data-item="${item.id}"
                                         onclick="${owned ? (isEquipped ? `MascotSystem.unequipItem('${groupId}', 'outfit')` : `MascotSystem.equipItem('${groupId}', '${item.id}')`) : ''}">
                                        <div class="item-emoji">${owned ? item.emoji : '❓'}</div>
                                        ${owned ? `
                                            <div class="item-level">${ITEM_LEVELS[owned.level].stars}</div>
                                            <div class="item-copies">${owned.copies}/10</div>
                                        ` : '<div class="item-locked" data-i18n="app.fundDetail.mascot.locked">Bloqueado</div>'}
                                        ${isEquipped ? '<div class="equipped-badge" title="Click to unequip">✓</div>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="collection-category">
                        <h5>🎒 <span data-i18n="app.fundDetail.mascot.accessories">Accesorios</span></h5>
                        <div class="collection-items">
                            ${accessoryItems.map(item => {
                                const owned = wardrobe[item.id];
                                const isEquipped = equipped.accessory === item.id;
                                const levelEffect = owned ? ITEM_LEVELS[owned.level].effect : '';
                                return `
                                    <div class="collection-item ${owned ? 'owned' : 'locked'} ${isEquipped ? 'equipped' : ''} ${levelEffect}"
                                         data-item="${item.id}"
                                         onclick="${owned ? (isEquipped ? `MascotSystem.unequipItem('${groupId}', 'accessory')` : `MascotSystem.equipItem('${groupId}', '${item.id}')`) : ''}">
                                        <div class="item-emoji">${owned ? item.emoji : '❓'}</div>
                                        ${owned ? `
                                            <div class="item-level">${ITEM_LEVELS[owned.level].stars}</div>
                                            <div class="item-copies">${owned.copies}/10</div>
                                        ` : '<div class="item-locked" data-i18n="app.fundDetail.mascot.locked">Bloqueado</div>'}
                                        ${isEquipped ? '<div class="equipped-badge" title="Click to unequip">✓</div>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    </div>
                </details>
                
                <div class="mascot-info">
                    <p><span style="font-size: 1.2em;">💡</span> <span data-i18n="app.fundDetail.mascot.info">Abre cofres semanales para obtener prendas. Al obtener 5 copias, mejora a Plata ✨. Con 10 copias, alcanza Oro ✨✨.</span></p>
                </div>
                
                ${chestHTML || ''}
                
                <div class="mascot-guide-wrapper">
                    <div class="mascot-guide-header">
                        <span data-i18n="app.fundDetail.mascot.guide.title">📖 How Does It Work?</span>
                    </div>
                    <div class="guide-content">
                        <h4 data-i18n="app.fundDetail.mascot.guide.weeklyChests">🎁 Weekly Chests</h4>
                        <p data-i18n="app.fundDetail.mascot.guide.weeklyChestsDesc">Each week, your group can open a chest that contains random items for your mascot. The better your colony status, the better rewards you'll get.</p>
                        
                        <h4 data-i18n="app.fundDetail.mascot.guide.colonyStates">🐜 Colony States & Rewards</h4>
                        <ul>
                            <li><strong data-i18n="app.fundDetail.mascot.guide.forming">🌱 Forming:</strong> <span data-i18n="app.fundDetail.mascot.guide.formingDesc">Only common items (backpack, scarf, tablet, etc.)</span></li>
                            <li><strong data-i18n="app.fundDetail.mascot.guide.active">🚀 Active:</strong> <span data-i18n="app.fundDetail.mascot.guide.activeDesc">70% common items, 30% rare items</span></li>
                            <li><strong data-i18n="app.fundDetail.mascot.guide.stable">⚡ Stable:</strong> <span data-i18n="app.fundDetail.mascot.guide.stableDesc">40% common items, 60% rare items</span></li>
                            <li><strong data-i18n="app.fundDetail.mascot.guide.consolidated">💎 Consolidated:</strong> <span data-i18n="app.fundDetail.mascot.guide.consolidatedDesc">All items available (best rewards!)</span></li>
                        </ul>
                        
                        <h4 data-i18n="app.fundDetail.mascot.guide.itemLevels">⭐ Item Levels</h4>
                        <ul>
                            <li><strong data-i18n="app.fundDetail.mascot.guide.basic">⭐ Basic:</strong> <span data-i18n="app.fundDetail.mascot.guide.basicDesc">1 copy obtained</span></li>
                            <li><strong data-i18n="app.fundDetail.mascot.guide.silver">⭐⭐✨ Silver:</strong> <span data-i18n="app.fundDetail.mascot.guide.silverDesc">5 copies obtained (silver shine!)</span></li>
                            <li><strong data-i18n="app.fundDetail.mascot.guide.gold">⭐⭐⭐✨✨ Gold:</strong> <span data-i18n="app.fundDetail.mascot.guide.goldDesc">10 copies obtained (golden glow!)</span></li>
                        </ul>
                        
                        <h4 data-i18n="app.fundDetail.mascot.guide.collection">🎒 Complete Collection</h4>
                        <p data-i18n="app.fundDetail.mascot.guide.collectionDesc">There are 18 unique items to collect: 6 for head, 6 for outfit, and 6 for accessory. You can equip one item in each slot to customize your group's ant mascot.</p>
                        
                        <h4 data-i18n="app.fundDetail.mascot.guide.tips">💡 Tips</h4>
                        <ul>
                            <li data-i18n="app.fundDetail.mascot.guide.tip1">Keep your expenses clear and organized to improve your colony status</li>
                            <li data-i18n="app.fundDetail.mascot.guide.tip2">Higher colony status = better items in weekly chests</li>
                            <li data-i18n="app.fundDetail.mascot.guide.tip3">Collect duplicate items to upgrade them to Silver and Gold levels</li>
                            <li data-i18n="app.fundDetail.mascot.guide.tip4">Click on any unlocked item to equip it to your mascot</li>
                        </ul>
                    </div>
                </div>
                </div>
            </div>
        `;
        
        console.log('[Mascot] HTML injected, converting guide to collapsible details...');
        
        // Convert mascot-guide-wrapper to details element (security-wrapper blocks <details> in innerHTML)
        const guideWrapper = container.querySelector('.mascot-guide-wrapper');
        if (guideWrapper) {
            const details = document.createElement('details');
            details.className = 'mascot-guide';
            details.setAttribute('open', '');
            
            const summary = document.createElement('summary');
            const header = guideWrapper.querySelector('.mascot-guide-header');
            if (header) {
                summary.innerHTML = header.innerHTML;
                header.remove();
            }
            
            const content = guideWrapper.querySelector('.guide-content');
            
            details.appendChild(summary);
            if (content) {
                details.appendChild(content);
            }
            
            guideWrapper.replaceWith(details);
            console.log('[Mascot] Guide converted to details element successfully');
        } else {
            console.error('[Mascot] .mascot-guide-wrapper not found!');
        }
        
        // Apply translations to the newly added content
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
            window.i18n.applyTranslations();
        }
    } catch (error) {
        console.error('[Mascot] Error loading tab:', error);
        container.innerHTML = '<div class="error-message">Error cargando mascota</div>';
    }
}

/**
 * Update mascot display in header (mini preview)
 */
async function updateMascotHeader(groupId) {
    if (!MASCOT_FEATURE_ENABLED) return;
    
    const container = document.getElementById('mascotHeaderContainer');
    if (!container) return;
    
    try {
        const mascotData = await getMascotData(groupId);
        const equipped = mascotData?.equipped || {};
        
        if (!equipped.head && !equipped.outfit && !equipped.accessory) {
            container.style.display = 'none';
            return;
        }
        
        const headEmoji = equipped.head ? WARDROBE_ITEMS[equipped.head].emoji : '';
        const outfitEmoji = equipped.outfit ? WARDROBE_ITEMS[equipped.outfit].emoji : '';
        const accessoryEmoji = equipped.accessory ? WARDROBE_ITEMS[equipped.accessory].emoji : '';
        
        container.style.display = 'inline-flex';
        container.innerHTML = `
            <div class="mascot-header-mini" title="Ver Mascota" onclick="switchFundTab('mascot')">
                ${headEmoji}🐜${outfitEmoji}${accessoryEmoji}
            </div>
        `;
    } catch (error) {
        console.error('[Mascot] Error updating header:', error);
    }
}

// ============================================
// EXPORT
// ============================================

window.MascotSystem = {
    getMascotData,
    equipItem: async (groupId, itemId) => {
        const success = await equipItem(groupId, itemId);
        if (success) {
            await loadMascotTab(groupId);
            await updateMascotHeader(groupId);
        }
        return success;
    },
    unequipItem: async (groupId, category) => {
        const success = await unequipItem(groupId, category);
        if (success) {
            await loadMascotTab(groupId);
            await updateMascotHeader(groupId);
        }
        return success;
    },
    addItemToWardrobe,
    getRandomItemByColonyState,
    loadMascotTab,
    updateMascotHeader,
    renderMascotPreview,
    createWelcomeChest,  // ✅ Export welcome chest creation function
    WARDROBE_ITEMS,
    ITEM_LEVELS,
    
    // Testing Functions
    async testAddRandomItem(groupId, colonyState = 'active') {
        const randomItem = getRandomItemByColonyState(colonyState);
        const result = await addItemToWardrobe(groupId, randomItem.id);
        
        console.log('🎁 Test item added:');
        console.log(`   Item: ${result.item.emoji} ${result.item.name}`);
        console.log(`   New: ${result.isNew ? 'Yes' : 'No'}`);
        console.log(`   Upgraded: ${result.upgraded ? 'Yes (to ' + result.newLevel + ')' : 'No'}`);
        console.log(`   Copies: ${result.copies}/6`);
        console.log(`   Level: ${result.newLevel} ${ITEM_LEVELS[result.newLevel].stars}`);
        
        await updateMascotHeader(groupId);
        return result;
    },
    
    async testUnlockAllItems(groupId, level = 'basic') {
        console.log('🔓 Unlocking all items at', level, 'level...');
        const copies = level === 'basic' ? 1 : level === 'silver' ? 3 : 6;
        
        for (const itemId of Object.keys(WARDROBE_ITEMS)) {
            for (let i = 0; i < copies; i++) {
                await addItemToWardrobe(groupId, itemId);
            }
        }
        
        console.log('✅ All 12 items unlocked at', level, 'level');
        await loadMascotTab(groupId);
        await updateMascotHeader(groupId);
    },
    
    async quickTestChest(groupId) {
        console.log('🚀 Quick Test: Opening chest with random item...');
        
        // Use colony state if available
        let colonyState = 'active';
        if (window.ColonySystem) {
            const colonyData = await window.ColonySystem.getColonyData(groupId);
            if (colonyData) colonyState = colonyData.state;
        }
        
        const result = await this.testAddRandomItem(groupId, colonyState);
        
        console.log('💡 Visit the Mascot tab to see your new item!');
        return result;
    }
};

// Mascot System initialized
