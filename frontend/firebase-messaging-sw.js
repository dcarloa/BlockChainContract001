/**
 * Firebase Cloud Messaging Service Worker
 * This file is automatically loaded by Firebase Messaging
 * DO NOT rename this file - Firebase expects firebase-messaging-sw.js
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Import Firebase config from existing file
importScripts('firebase-credentials.js');

// Initialize Firebase with config
firebase.initializeApp(window.FirebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);
    
    const notificationTitle = payload.notification?.title || 'Ant Pool';
    const notificationOptions = {
        body: payload.notification?.body || 'New notification',
        icon: payload.notification?.icon || '/assets/logo-192x192.png',
        badge: '/assets/logo-192x192.png',
        tag: payload.data?.fundId || 'general',
        data: payload.data,
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification.tag);
    
    event.notification.close();
    
    // Open app and navigate to fund if provided
    const fundId = event.notification.data?.fundId;
    const urlToOpen = fundId 
        ? `${self.location.origin}/?fund=${fundId}`
        : self.location.origin;
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Focus existing window if available
                for (let client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

console.log('[firebase-messaging-sw.js] Service Worker loaded');
