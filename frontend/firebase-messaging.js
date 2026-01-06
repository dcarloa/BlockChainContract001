/**
 * Firebase Cloud Messaging - Push Notifications
 * Handles FCM token registration and permission requests
 */

let messagingInstance = null;
let currentFCMToken = null;

/**
 * Initialize Firebase Messaging
 * Call this after Firebase is initialized
 */
async function initializeMessaging() {
    try {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.warn('⚠️ This browser does not support notifications');
            return false;
        }

        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Worker not supported');
            return false;
        }

        // Wait for Firebase to be ready
        if (typeof firebase === 'undefined' || !firebase.messaging) {
            console.warn('⚠️ Firebase Messaging not loaded');
            return false;
        }

        // Get existing service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // Initialize messaging with existing service worker
        messagingInstance = firebase.messaging();
        messagingInstance.useServiceWorker(registration);

        // Handle foreground messages
        messagingInstance.onMessage((payload) => {
            console.log('📬 Foreground message received:', payload);
            
            // Show in-app notification
            if (payload.notification) {
                showInAppNotification(payload.notification, payload.data);
            }
            
            // Refresh notifications panel
            if (typeof loadNotifications === 'function') {
                loadNotifications();
            }
        });

        console.log('✅ Firebase Messaging initialized');
        return true;

    } catch (error) {
        console.error('❌ Error initializing Firebase Messaging:', error);
        return false;
    }
}

/**
 * Request notification permission and get FCM token
 */
async function requestNotificationPermission() {
    try {
        // Check if already granted
        if (Notification.permission === 'granted') {
            return await getFCMToken();
        }

        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('✅ Notification permission granted');
            return await getFCMToken();
        } else {
            console.log('⚠️ Notification permission denied');
            return null;
        }

    } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
        return null;
    }
}

/**
 * Get FCM token for this device
 */
async function getFCMToken() {
    try {
        if (!messagingInstance) {
            await initializeMessaging();
        }

        if (!messagingInstance) {
            return null;
        }

        // Get token with VAPID key
        const token = await messagingInstance.getToken({
            vapidKey: 'BFn59UsYljZZxXP7BOaI8p5YIVaBPJU5nuzvzELHsO7PHUextLqSqeIil70geTDf_lapKKRAEIYH76WW9dxitLY'
        });

        if (token) {
            console.log('✅ FCM Token obtained');
            currentFCMToken = token;
            
            // Save token to Firebase
            await saveFCMToken(token);
            
            return token;
        } else {
            console.log('⚠️ No FCM token available');
            return null;
        }

    } catch (error) {
        console.error('❌ Error getting FCM token:', error);
        return null;
    }
}

/**
 * Save FCM token to Firebase Database
 */
async function saveFCMToken(token) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn('⚠️ User not authenticated, cannot save FCM token');
            return;
        }

        const userId = user.uid;
        
        // Save token with timestamp
        await firebase.database().ref(`fcmTokens/${userId}/${token}`).set({
            token: token,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            }
        });

        console.log('✅ FCM token saved to database');

    } catch (error) {
        console.error('❌ Error saving FCM token:', error);
    }
}

/**
 * Remove FCM token from Firebase (when user logs out or disables notifications)
 */
async function removeFCMToken() {
    try {
        if (!currentFCMToken) {
            return;
        }

        const user = firebase.auth().currentUser;
        if (!user) {
            return;
        }

        await firebase.database()
            .ref(`fcmTokens/${user.uid}/${currentFCMToken}`)
            .remove();

        console.log('✅ FCM token removed');
        currentFCMToken = null;

    } catch (error) {
        console.error('❌ Error removing FCM token:', error);
    }
}

/**
 * Check if notifications are enabled for current user
 */
function areNotificationsEnabled() {
    return Notification.permission === 'granted';
}

/**
 * Show in-app notification when app is in foreground
 */
function showInAppNotification(notification, data) {
    try {
        // Create notification banner
        const banner = document.createElement('div');
        banner.className = 'push-notification-banner';
        banner.innerHTML = `
            <div class="push-notification-content">
                <div class="push-notification-icon">🔔</div>
                <div class="push-notification-text">
                    <h4>${notification.title}</h4>
                    <p>${notification.body}</p>
                </div>
                <button class="push-notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;

        // Add click handler
        banner.addEventListener('click', (e) => {
            if (!e.target.classList.contains('push-notification-close')) {
                if (data?.fundId) {
                    window.location.href = `/app.html?fund=${data.fundId}`;
                }
                banner.remove();
            }
        });

        // Add to page
        document.body.appendChild(banner);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            banner.classList.add('fade-out');
            setTimeout(() => banner.remove(), 300);
        }, 5000);

        // Add CSS if not exists
        if (!document.getElementById('push-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'push-notification-styles';
            style.textContent = `
                .push-notification-banner {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1rem;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                    z-index: 10000;
                    max-width: 400px;
                    cursor: pointer;
                    animation: slideIn 0.3s ease-out;
                }
                .push-notification-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .push-notification-icon {
                    font-size: 2rem;
                }
                .push-notification-text h4 {
                    margin: 0 0 0.25rem 0;
                    font-size: 1rem;
                }
                .push-notification-text p {
                    margin: 0;
                    font-size: 0.875rem;
                    opacity: 0.9;
                }
                .push-notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                .push-notification-close:hover {
                    opacity: 1;
                }
                .push-notification-banner.fade-out {
                    animation: slideOut 0.3s ease-in forwards;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

    } catch (error) {
        console.error('❌ Error showing in-app notification:', error);
    }
}

// Make functions globally available
window.initializeMessaging = initializeMessaging;
window.requestNotificationPermission = requestNotificationPermission;
window.getFCMToken = getFCMToken;
window.removeFCMToken = removeFCMToken;
window.areNotificationsEnabled = areNotificationsEnabled;
