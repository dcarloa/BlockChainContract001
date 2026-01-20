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
    }
};

// Item levels
const ITEM_LEVELS = {
    basic: { name: 'Básico', stars: '⭐', copies: 1, color: '#9ca3af' },
    silver: { name: 'Plata', stars: '⭐⭐', copies: 3, color: '#c0c0c0' },
    gold: { name: 'Oro', stars: '⭐⭐⭐', copies: 6, color: '#ffd700' }
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
    if (copies >= 6) return 'gold';
    if (copies >= 3) return 'silver';
    return 'basic';
}

/**
 * Render mascot preview with equipped items
 */
function renderMascotPreview(mascotData, size = 'normal') {
    const equipped = mascotData?.equipped || {};
    const wardrobe = mascotData?.wardrobe || {};
    
    const headItem = equipped.head ? WARDROBE_ITEMS[equipped.head] : null;
    const accessoryItem = equipped.accessory ? WARDROBE_ITEMS[equipped.accessory] : null;
    
    const sizeClass = size === 'small' ? 'mascot-preview-small' : 'mascot-preview';
    
    return `
        <div class="${sizeClass}">
            ${headItem ? `<div class="mascot-item-head">${headItem.emoji}</div>` : ''}
            <div class="mascot-body">🐜</div>
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
        const accessoryItems = Object.values(WARDROBE_ITEMS).filter(i => i.category === 'accessory');
        
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
                                    ? `<span class="item-emoji">${WARDROBE_ITEMS[equipped.head].emoji}</span>
                                       <span class="item-level">${ITEM_LEVELS[wardrobe[equipped.head]?.level || 'basic'].stars}</span>`
                                    : '<span class="slot-empty" data-i18n="app.fundDetail.mascot.empty">Vacío</span>'}
                            </div>
                        </div>
                        <div class="equipped-slot" data-slot="accessory">
                            <div class="slot-label" data-i18n="app.fundDetail.mascot.accessory">Accesorio</div>
                            <div class="slot-item">
                                ${equipped.accessory 
                                    ? `<span class="item-emoji">${WARDROBE_ITEMS[equipped.accessory].emoji}</span>
                                       <span class="item-level">${ITEM_LEVELS[wardrobe[equipped.accessory]?.level || 'basic'].stars}</span>`
                                    : '<span class="slot-empty" data-i18n="app.fundDetail.mascot.empty">Vacío</span>'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mascot-collection">
                    <h4><span data-i18n="app.fundDetail.mascot.collection">Colección</span> (${totalItems}/12)</h4>
                    
                    <div class="collection-category">
                        <h5>🎩 <span data-i18n="app.fundDetail.mascot.head">Cabeza</span></h5>
                        <div class="collection-items">
                            ${headItems.map(item => {
                                const owned = wardrobe[item.id];
                                const isEquipped = equipped.head === item.id;
                                return `
                                    <div class="collection-item ${owned ? 'owned' : 'locked'} ${isEquipped ? 'equipped' : ''}" 
                                         data-item="${item.id}"
                                         onclick="${owned ? `MascotSystem.equipItem('${groupId}', '${item.id}')` : ''}">
                                        <div class="item-emoji">${owned ? item.emoji : '❓'}</div>
                                        ${owned ? `
                                            <div class="item-level">${ITEM_LEVELS[owned.level].stars}</div>
                                            <div class="item-copies">${owned.copies}/6</div>
                                        ` : '<div class="item-locked" data-i18n="app.fundDetail.mascot.locked">Bloqueado</div>'}
                                        ${isEquipped ? '<div class="equipped-badge">✓</div>' : ''}
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
                                return `
                                    <div class="collection-item ${owned ? 'owned' : 'locked'} ${isEquipped ? 'equipped' : ''}"
                                         data-item="${item.id}"
                                         onclick="${owned ? `MascotSystem.equipItem('${groupId}', '${item.id}')` : ''}">
                                        <div class="item-emoji">${owned ? item.emoji : '❓'}</div>
                                        ${owned ? `
                                            <div class="item-level">${ITEM_LEVELS[owned.level].stars}</div>
                                            <div class="item-copies">${owned.copies}/6</div>
                                        ` : '<div class="item-locked" data-i18n="app.fundDetail.mascot.locked">Bloqueado</div>'}
                                        ${isEquipped ? '<div class="equipped-badge">✓</div>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="mascot-info">
                    <p><span style="font-size: 1.2em;">💡</span> <span data-i18n="app.fundDetail.mascot.info">Abre cofres semanales para obtener prendas. Al obtener 3 copias, mejora a Plata. Con 6 copias, alcanza Oro.</span></p>
                </div>
                
                <div class="mascot-guide">
                    <details>
                        <summary>
                            <span data-i18n="app.fundDetail.mascot.guide.title">📖 How Does It Work?</span>
                        </summary>
                        <div class="guide-content">
                            <h4 data-i18n="app.fundDetail.mascot.guide.weeklyChests">🎁 Weekly Chests</h4>
                            <p data-i18n="app.fundDetail.mascot.guide.weeklyChestsDesc">Each week, your group can open a chest that contains random items for your mascot. The better your colony status, the better rewards you'll get.</p>
                            
                            <h4 data-i18n="app.fundDetail.mascot.guide.colonyStates">🐜 Colony States & Rewards</h4>
                            <ul>
                                <li><strong data-i18n="app.fundDetail.mascot.guide.forming">🌱 Forming:</strong> <span data-i18n="app.fundDetail.mascot.guide.formingDesc">Only common items (backpack, pickaxe, tablet)</span></li>
                                <li><strong data-i18n="app.fundDetail.mascot.guide.active">🚀 Active:</strong> <span data-i18n="app.fundDetail.mascot.guide.activeDesc">70% common items, 30% rare items</span></li>
                                <li><strong data-i18n="app.fundDetail.mascot.guide.stable">⚡ Stable:</strong> <span data-i18n="app.fundDetail.mascot.guide.stableDesc">40% common items, 60% rare items</span></li>
                                <li><strong data-i18n="app.fundDetail.mascot.guide.consolidated">💎 Consolidated:</strong> <span data-i18n="app.fundDetail.mascot.guide.consolidatedDesc">All items available (best rewards!)</span></li>
                            </ul>
                            
                            <h4 data-i18n="app.fundDetail.mascot.guide.itemLevels">⭐ Item Levels</h4>
                            <ul>
                                <li><strong data-i18n="app.fundDetail.mascot.guide.basic">⭐ Basic:</strong> <span data-i18n="app.fundDetail.mascot.guide.basicDesc">1 copy obtained</span></li>
                                <li><strong data-i18n="app.fundDetail.mascot.guide.silver">⭐⭐ Silver:</strong> <span data-i18n="app.fundDetail.mascot.guide.silverDesc">3 copies obtained (upgraded!)</span></li>
                                <li><strong data-i18n="app.fundDetail.mascot.guide.gold">⭐⭐⭐ Gold:</strong> <span data-i18n="app.fundDetail.mascot.guide.goldDesc">6 copies obtained (max level!)</span></li>
                            </ul>
                            
                            <h4 data-i18n="app.fundDetail.mascot.guide.collection">🎒 Complete Collection</h4>
                            <p data-i18n="app.fundDetail.mascot.guide.collectionDesc">There are 12 unique items to collect: 6 for the head slot and 6 for the accessory slot. You can equip one item in each slot to customize your group's ant mascot.</p>
                            
                            <h4 data-i18n="app.fundDetail.mascot.guide.tips">💡 Tips</h4>
                            <ul>
                                <li data-i18n="app.fundDetail.mascot.guide.tip1">Keep your expenses clear and organized to improve your colony status</li>
                                <li data-i18n="app.fundDetail.mascot.guide.tip2">Higher colony status = better items in weekly chests</li>
                                <li data-i18n="app.fundDetail.mascot.guide.tip3">Collect duplicate items to upgrade them to Silver and Gold levels</li>
                                <li data-i18n="app.fundDetail.mascot.guide.tip4">Click on any unlocked item to equip it to your mascot</li>
                            </ul>
                        </div>
                    </details>
                </div>
            </div>
        `;
        
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
        
        if (!equipped.head && !equipped.accessory) {
            container.style.display = 'none';
            return;
        }
        
        const headEmoji = equipped.head ? WARDROBE_ITEMS[equipped.head].emoji : '';
        const accessoryEmoji = equipped.accessory ? WARDROBE_ITEMS[equipped.accessory].emoji : '';
        
        container.style.display = 'inline-flex';
        container.innerHTML = `
            <div class="mascot-header-mini" title="Ver Mascota" onclick="switchFundTab('mascot')">
                ${headEmoji}🐜${accessoryEmoji}
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

console.log('✅ Mascot System initialized');
console.log('💡 Total wardrobe items:', Object.keys(WARDROBE_ITEMS).length);
