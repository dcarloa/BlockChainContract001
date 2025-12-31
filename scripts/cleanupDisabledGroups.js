// Script to delete all disabled Simple Mode groups from Firebase
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, remove } = require('firebase/database');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const readline = require('readline');

// Firebase credentials
const firebaseConfig = {
    apiKey: "AIzaSyA_EJRI7BIyHxSgMg5V8sQqndp_-v-t_C0",
    authDomain: "blockchaincontract001.firebaseapp.com",
    databaseURL: "https://blockchaincontract001-default-rtdb.firebaseio.com",
    projectId: "blockchaincontract001",
    storageBucket: "blockchaincontract001.firebasestorage.app",
    messagingSenderId: "949285642052",
    appId: "1:949285642052:web:7b0f7c0106ffd59f39c111"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function cleanupDisabledGroups() {
    console.log('🔍 Buscando grupos de Simple Mode deshabilitados...\n');
    
    try {
        // Read all groups
        const groupsRef = ref(db, 'groups');
        const groupsSnapshot = await get(groupsRef);
        const groups = groupsSnapshot.val();
        
        if (!groups) {
            console.log('❌ No se encontraron grupos en la base de datos');
            process.exit(0);
        }
        
        let deletedCount = 0;
        let totalGroups = 0;
        
        for (const [groupId, groupData] of Object.entries(groups)) {
            totalGroups++;
            
            // Check if group is disabled (isActive: false)
            if (groupData.isActive === false) {
                console.log(`\n🗑️ Eliminando grupo: ${groupData.name || groupId}`);
                console.log(`   ID: ${groupId}`);
                console.log(`   Creado por: ${groupData.createdByEmail || 'unknown'}`);
                console.log(`   Fecha creación: ${groupData.createdAt ? new Date(groupData.createdAt).toLocaleString() : 'unknown'}`);
                
                // Delete group from Firebase
                const groupRef = ref(db, `groups/${groupId}`);
                await remove(groupRef);
                
                // Remove group from all members' user data
                if (groupData.members) {
                    for (const memberId of Object.keys(groupData.members)) {
                        const userGroupRef = ref(db, `users/${memberId}/groups/${groupId}`);
                        await remove(userGroupRef);
                        console.log(`   ✓ Eliminado de usuario: ${memberId}`);
                    }
                }
                
                deletedCount++;
                console.log(`   ✅ Grupo eliminado completamente`);
            }
        }
        
        console.log(`\n\n📊 RESUMEN:`);
        console.log(`   Total de grupos analizados: ${totalGroups}`);
        console.log(`   Grupos eliminados: ${deletedCount}`);
        console.log(`   Grupos activos restantes: ${totalGroups - deletedCount}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error al limpiar grupos:', error);
        process.exit(1);
    }
}

// Run cleanup
(async () => {
    try {
        // Get credentials from user
        const email = await question('Ingresa tu email de Firebase: ');
        const password = await question('Ingresa tu contraseña: ');
        
        console.log('\n🔐 Autenticando...');
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Autenticado correctamente\n');
        
        await cleanupDisabledGroups();
        
    } catch (error) {
        console.error('❌ Error de autenticación:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
})();
