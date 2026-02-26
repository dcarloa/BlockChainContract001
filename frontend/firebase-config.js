// Firebase Configuration and Initialization
// Manages connection to Firebase services for Simple Mode

// Firebase SDK imports (loaded via CDN in HTML)
// Required: firebase-app, firebase-auth, firebase-database

// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Production Firebase Configuration
// These credentials are safe to expose in client-side code
// Firebase security is handled by Database Rules and Auth configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_EJRI7BIyHxSgMg5V8sQqndp_-v-t_C0",
  authDomain: "blockchaincontract001.firebaseapp.com",
  databaseURL: "https://blockchaincontract001-default-rtdb.firebaseio.com",
  projectId: "blockchaincontract001",
  storageBucket: "blockchaincontract001.firebasestorage.app",
  messagingSenderId: "949285642052",
  appId: "1:949285642052:web:7b0f7c0106ffd59f39c111",
  measurementId: "G-Z9T21SPHQ2"
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
        
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.error("❌ Firebase SDK not loaded!");
            throw new Error("Firebase SDK not loaded. Please refresh the page.");
        }
        
        // Check if already initialized
        if (firebaseApp) {
            return true;
        }
        
        // Initialize Firebase app
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        firebaseDatabase = firebase.database();
        
        // Check for payment result in URL
        checkPaymentResult();
        
        // Setup auth state listener
        firebaseAuth.onAuthStateChanged((user) => {
            currentUser = user;
            if (user) {
                onFirebaseUserChange(user);
            } else {
                onFirebaseUserChange(null);
            }
        });
        
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
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            throw new Error("Firebase SDK not loaded. Please refresh the page.");
        }
        
        // Check if Firebase is initialized
        if (!firebaseAuth) {
            await initializeFirebase();
        }
        
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebaseAuth.signInWithPopup(provider);
        
        // Return user with isNewUser flag for analytics
        const isNewUser = result.additionalUserInfo?.isNewUser || false;
        result.user.isNewUser = isNewUser;
        console.log(`🔐 Google sign-in: ${isNewUser ? 'NEW user' : 'RETURNING user'}`);
        
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
        // Check if Firebase is initialized
        if (!firebaseAuth) {
            await initializeFirebase();
        }
        
        const result = await firebaseAuth.signInWithEmailAndPassword(email, password);
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
        // Check if Firebase is initialized
        if (!firebaseAuth) {
            await initializeFirebase();
        }
        
        const result = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        
        // Update profile with display name
        await result.user.updateProfile({
            displayName: displayName
        });
        
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
    // Call the external callback if set
    if (typeof window.FirebaseConfig.onAuthStateChanged === 'function') {
        window.FirebaseConfig.onAuthStateChanged(user);
    }
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
// PERSONAL COLONY AUTO-CREATION
// ============================================

/**
 * Ensure user has a personal colony
 * Creates one automatically if it doesn't exist
 * @param {Object} user Firebase user object
 * @returns {Promise<string>} Personal colony ID
 */
async function ensurePersonalColony(user) {
    if (!user) {
        console.warn('⚠️ Cannot ensure personal colony: no user provided');
        return null;
    }
    
    const personalColonyId = `grp_personal_${user.uid}`;
    
    try {
        // Check if personal colony already exists
        const existingColony = await readDb(`groups/${personalColonyId}`);
        
        if (existingColony) {
            console.log('🐜 Personal colony already exists:', personalColonyId);
            // Update user reference
            await updateDb(`users/${user.uid}`, { personalColony: personalColonyId });
            return personalColonyId;
        }
        
        // Create new personal colony
        console.log('🐜 Creating personal colony for user:', user.uid);
        await createPersonalColony(user, personalColonyId);
        
        return personalColonyId;
        
    } catch (error) {
        console.error('❌ Error ensuring personal colony:', error);
        return null;
    }
}

/**
 * Create a new personal colony for user
 * @param {Object} user Firebase user object
 * @param {string} colonyId Colony ID
 * @returns {Promise<void>}
 */
async function createPersonalColony(user, colonyId) {
    const timestamp = Date.now();
    
    // Get translation function for colony name
    const colonyName = typeof t === 'function' 
        ? t('app.personalColony.name') 
        : 'My Colony';
    
    const colonyData = {
        id: colonyId,
        name: colonyName,
        description: '',
        icon: '🐜',
        mode: 'simple',
        isPersonal: true,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdByName: user.displayName || user.email,
        createdAt: timestamp,
        isActive: true,
        targetAmount: 0,
        currency: 'USD',
        preferredCurrency: 'NONE',
        
        // Only the user as member
        members: {
            [user.uid]: {
                email: user.email,
                name: user.displayName || user.email,
                joinedAt: timestamp,
                role: 'creator',
                totalContributed: 0
            }
        },
        
        // Empty expenses
        expenses: {},
        
        // No settlements needed for personal
        settlements: {},
        
        // Personal settings
        settings: {
            isPersonal: true,
            showBalances: false,
            showMembers: false,
            notificationsEnabled: true
        }
    };
    
    // Write colony to database
    await writeDb(`groups/${colonyId}`, colonyData);
    
    // Add reference to user's data
    await updateDb(`users/${user.uid}`, {
        personalColony: colonyId,
        [`groups/${colonyId}`]: {
            name: colonyName,
            role: 'creator',
            joinedAt: timestamp,
            isPersonal: true
        }
    });
    
    console.log('✅ Personal colony created successfully:', colonyId);
    
    // Track analytics event
    if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('personalColonyCreated', {
            detail: { colonyId, userId: user.uid }
        }));
    }
}

// ============================================
// PAYMENT RESULT HANDLER
// ============================================

/**
 * Check URL parameters for payment result
 */
function checkPaymentResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
        // Show success message
        setTimeout(() => {
            if (typeof showToast === 'function') {
                showToast(t('subscription.paymentSuccess'), 'success');
            }
        }, 1000);
        
        // Clean URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        // Reload subscription status after a delay
        setTimeout(() => {
            if (typeof loadSubscriptionStatus === 'function') {
                loadSubscriptionStatus();
            }
        }, 2000);
    } else if (paymentStatus === 'cancelled') {
        // Show cancelled message
        setTimeout(() => {
            if (typeof showToast === 'function') {
                showToast(t('subscription.paymentCancelled'), 'info');
            }
        }, 500);
        
        // Clean URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }
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
    onAuthStateChanged: null, // Will be set by app
    getDbRef,
    writeDb,
    updateDb,
    readDb,
    deleteDb,
    pushDb,
    listenDb,
    checkPaymentResult,
    ensurePersonalColony,
    createPersonalColony
};
