// Firebase Configuration and Initialization
// Manages connection to Firebase services for Simple Mode

// Firebase SDK imports (loaded via CDN in HTML)
// Required: firebase-app, firebase-auth, firebase-database

// ============================================
// FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Replace with your Firebase API key
    authDomain: "blockchaincontract001.firebaseapp.com",
    databaseURL: "https://blockchaincontract001-default-rtdb.firebaseio.com",
    projectId: "blockchaincontract001",
    storageBucket: "blockchaincontract001.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID", // Replace with your sender ID
    appId: "YOUR_APP_ID" // Replace with your app ID
};

// ============================================
// FIREBASE INITIALIZATION
// ============================================

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDatabase = null;
let currentUser = null;

/**
 * Initialize Firebase services
 * @returns {Promise<boolean>} Success status
 */
async function initializeFirebase() {
    try {
        console.log("🔥 Initializing Firebase...");
        
        // Initialize Firebase app
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        firebaseDatabase = firebase.database();
        
        // Setup auth state listener
        firebaseAuth.onAuthStateChanged((user) => {
            currentUser = user;
            if (user) {
                console.log("✅ Firebase user authenticated:", user.email);
                onFirebaseUserChange(user);
            } else {
                console.log("🚪 No Firebase user authenticated");
                onFirebaseUserChange(null);
            }
        });
        
        console.log("✅ Firebase initialized successfully");
        return true;
    } catch (error) {
        console.error("❌ Firebase initialization failed:", error);
        return false;
    }
}

/**
 * Sign in with Google
 * @returns {Promise<Object>} User object
 */
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebaseAuth.signInWithPopup(provider);
        console.log("✅ Google sign-in successful:", result.user.email);
        return result.user;
    } catch (error) {
        console.error("❌ Google sign-in failed:", error);
        throw error;
    }
}

/**
 * Sign in with email/password
 * @param {string} email User email
 * @param {string} password User password
 * @returns {Promise<Object>} User object
 */
async function signInWithEmail(email, password) {
    try {
        const result = await firebaseAuth.signInWithEmailAndPassword(email, password);
        console.log("✅ Email sign-in successful:", result.user.email);
        return result.user;
    } catch (error) {
        console.error("❌ Email sign-in failed:", error);
        throw error;
    }
}

/**
 * Create account with email/password
 * @param {string} email User email
 * @param {string} password User password
 * @param {string} displayName User display name
 * @returns {Promise<Object>} User object
 */
async function createAccount(email, password, displayName) {
    try {
        const result = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        
        // Update profile with display name
        await result.user.updateProfile({
            displayName: displayName
        });
        
        console.log("✅ Account created successfully:", result.user.email);
        return result.user;
    } catch (error) {
        console.error("❌ Account creation failed:", error);
        throw error;
    }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
async function signOut() {
    try {
        await firebaseAuth.signOut();
        console.log("✅ User signed out");
    } catch (error) {
        console.error("❌ Sign out failed:", error);
        throw error;
    }
}

/**
 * Get current authenticated user
 * @returns {Object|null} Current user or null
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
    return currentUser !== null;
}

/**
 * Callback for auth state changes (to be implemented in app)
 * @param {Object|null} user Current user
 */
function onFirebaseUserChange(user) {
    // This will be overridden by app-platform.js
    console.log("Auth state changed:", user ? user.email : "No user");
}

// ============================================
// DATABASE HELPERS
// ============================================

/**
 * Get reference to database path
 * @param {string} path Database path
 * @returns {Object} Database reference
 */
function getDbRef(path) {
    return firebaseDatabase.ref(path);
}

/**
 * Write data to database
 * @param {string} path Database path
 * @param {*} data Data to write
 * @returns {Promise<void>}
 */
async function writeDb(path, data) {
    try {
        await firebaseDatabase.ref(path).set(data);
        console.log(`✅ Data written to ${path}`);
    } catch (error) {
        console.error(`❌ Failed to write to ${path}:`, error);
        throw error;
    }
}

/**
 * Update data in database
 * @param {string} path Database path
 * @param {Object} updates Updates object
 * @returns {Promise<void>}
 */
async function updateDb(path, updates) {
    try {
        await firebaseDatabase.ref(path).update(updates);
        console.log(`✅ Data updated at ${path}`);
    } catch (error) {
        console.error(`❌ Failed to update ${path}:`, error);
        throw error;
    }
}

/**
 * Read data from database
 * @param {string} path Database path
 * @returns {Promise<*>} Data at path
 */
async function readDb(path) {
    try {
        const snapshot = await firebaseDatabase.ref(path).once('value');
        return snapshot.val();
    } catch (error) {
        console.error(`❌ Failed to read from ${path}:`, error);
        throw error;
    }
}

/**
 * Delete data from database
 * @param {string} path Database path
 * @returns {Promise<void>}
 */
async function deleteDb(path) {
    try {
        await firebaseDatabase.ref(path).remove();
        console.log(`✅ Data deleted from ${path}`);
    } catch (error) {
        console.error(`❌ Failed to delete from ${path}:`, error);
        throw error;
    }
}

/**
 * Push new data to database (generates unique key)
 * @param {string} path Database path
 * @param {*} data Data to push
 * @returns {Promise<string>} Generated key
 */
async function pushDb(path, data) {
    try {
        const ref = await firebaseDatabase.ref(path).push(data);
        console.log(`✅ Data pushed to ${path} with key ${ref.key}`);
        return ref.key;
    } catch (error) {
        console.error(`❌ Failed to push to ${path}:`, error);
        throw error;
    }
}

/**
 * Listen to database changes
 * @param {string} path Database path
 * @param {Function} callback Callback function
 * @returns {Function} Unsubscribe function
 */
function listenDb(path, callback) {
    const ref = firebaseDatabase.ref(path);
    ref.on('value', (snapshot) => {
        callback(snapshot.val());
    });
    
    // Return unsubscribe function
    return () => ref.off('value');
}

// ============================================
// EXPORTS
// ============================================

// Export functions to global scope for use in other files
window.FirebaseConfig = {
    initialize: initializeFirebase,
    signInWithGoogle,
    signInWithEmail,
    createAccount,
    signOut,
    getCurrentUser,
    isAuthenticated,
    getDbRef,
    writeDb,
    updateDb,
    readDb,
    deleteDb,
    pushDb,
    listenDb
};
