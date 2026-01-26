// Temporary script to reset a weekly chest
const admin = require('firebase-admin');

// Initialize with default credentials (uses GOOGLE_APPLICATION_CREDENTIALS env var)
admin.initializeApp({
    databaseURL: 'https://blockchaincontract001-default-rtdb.firebaseio.com'
});

const db = admin.database();
const groupId = 'grp_1768111910719_y7zcdhjps';
const weekId = '2026-W05';

async function resetChest() {
    try {
        await db.ref(`simpleGroups/${groupId}/colony/weeklyChests/${weekId}`).update({
            isOpened: false,
            openedAt: null,
            reward: null
        });
        console.log(`✅ Chest reset successfully for ${groupId} week ${weekId}`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

resetChest();
