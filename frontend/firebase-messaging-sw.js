/**
 * Firebase Cloud Messaging Service Worker
 * Required by firebase-messaging-compat.js
 * This file MUST be named firebase-messaging-sw.js
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyA_EJRI7BIyHxSgMg5V8sQqndp_-v-t_C0",
    authDomain: "antpool.cloud",
    projectId: "blockchaincontract001",
    messagingSenderId: "949285642052",
    appId: "1:949285642052:web:7b0f7c0106ffd59f39c111"
});

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages (when app is closed or not focused)
messaging.onBackgroundMessage((payload) => {
    console.log('[FCM-SW] Background message:', payload);
    
    const notificationTitle = payload.notification?.title || 'Ant Pool';
    const notificationOptions = {
        body: payload.notification?.body || 'New notification',
        icon: '/assets/web-app-manifest-192x192.png',
        badge: '/assets/favicon-96x96.png',
        data: payload.data
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const fundId = event.notification.data?.fundId;
    const urlToOpen = fundId 
        ? `${self.location.origin}/app.html?fund=${fundId}`
        : `${self.location.origin}/app.html`;
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (let client of clientList) {
                    if (client.url.includes('/app.html') && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

console.log('[FCM-SW] Firebase Messaging Service Worker loaded');
