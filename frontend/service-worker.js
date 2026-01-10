// Service Worker para Ant Pool PWA
// Dominio Principal: https://antpool.cloud
// Dominio Secundario: https://blockchaincontract001.web.app

// Import Firebase Messaging for background notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Versión del cache - incrementar cuando actualices recursos
const CACHE_VERSION = 'ant-pool-v1.3.9';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Recursos estáticos para cachear en la instalación
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.html',
    '/index-v2.html',
    '/offline.html',
    '/landing-styles.css',
    '/styles.css',
    '/styles-platform.css',
    '/simple-mode-styles.css',
    '/create-group-styles.css',
    '/form-wizard-styles.css',
    '/new-features-styles.css',
    '/wallet-connector.css',
    '/landing-script.js',
    '/app-platform.js',
    '/app-v2.js',
    '/i18n.js',
    '/theme.js',
    '/mode-manager.js',
    '/form-wizard.js',
    '/wallet-connector.js',
    '/firebase-config.js',
    '/ethers.umd.min.js',
    '/assets/LogoAntPool.png',
    '/assets/favicon.ico',
    '/assets/favicon-96x96.png',
    '/assets/apple-touch-icon.png',
    '/assets/web-app-manifest-192x192.png',
    '/assets/web-app-manifest-512x512.png',
    '/manifest.json'
];

// URLs que NO deben cachearse
const EXCLUDE_URLS = [
    '/firebase-credentials.js',
    'firebaseinstallations.googleapis.com',
    'identitytoolkit.googleapis.com',
    'securetoken.googleapis.com',
    'google-analytics.com',
    'googletagmanager.com',
    'analytics.google.com'
];

// Verificar si una URL debe ser excluida del cache
function shouldExclude(url) {
    return EXCLUDE_URLS.some(excluded => url.includes(excluded));
}

// INSTALL - Cachear recursos estáticos
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                // Cachear en paralelo con Promise.allSettled para no fallar si algún recurso falla
                return Promise.allSettled(
                    STATIC_ASSETS.map(url => 
                        cache.add(url).catch(err => {
                            console.warn(`[Service Worker] Failed to cache ${url}:`, err);
                            return null;
                        })
                    )
                );
            })
            .then(() => {
                console.log('[Service Worker] Static assets cached');
                return self.skipWaiting(); // Activar inmediatamente
            })
            .catch((err) => {
                console.error('[Service Worker] Installation failed:', err);
            })
    );
});

// ACTIVATE - Limpiar caches antiguos
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Eliminar caches que no coincidan con la versión actual
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== API_CACHE) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated');
                return self.clients.claim(); // Tomar control de todas las páginas
            })
    );
});

// FETCH - Estrategia de cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // No cachear URLs excluidas
    if (shouldExclude(request.url)) {
        return event.respondWith(fetch(request));
    }
    
    // No cachear POST, PUT, DELETE (solo GET)
    if (request.method !== 'GET') {
        return event.respondWith(fetch(request));
    }
    
    // Estrategia según el tipo de recurso
    if (request.url.includes('firebasestorage.googleapis.com')) {
        // API de Firebase Storage: Network First con cache fallback
        event.respondWith(networkFirstStrategy(request, API_CACHE));
    } else if (request.url.includes('firebaseio.com') || request.url.includes('googleapis.com')) {
        // APIs de Firebase: Network Only (no cachear datos en tiempo real)
        event.respondWith(fetch(request));
    } else if (request.destination === 'image') {
        // Imágenes: Cache First con network fallback
        event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
    } else if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
        // Recursos estáticos: Cache First
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    } else {
        // Otros recursos: Stale While Revalidate
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    }
});

// Estrategia: Cache First (intenta cache, luego red)
async function cacheFirstStrategy(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        // Cachear respuesta si es exitosa
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Cache First failed:', error);
        
        // Fallback: página offline
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
        
        // Si ni siquiera offline.html está cacheada, intentar index.html
        const cachedIndex = await caches.match('/index.html');
        if (cachedIndex) {
            return cachedIndex;
        }
        
        return new Response('Offline - No cached version available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia: Network First (intenta red, luego cache)
async function networkFirstStrategy(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        // Cachear respuesta si es exitosa
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Offline - No cached version available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia: Stale While Revalidate (devuelve cache y actualiza en background)
async function staleWhileRevalidate(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(async (networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            // Clone BEFORE using the response
            const responseToCache = networkResponse.clone();
            await cache.put(request, responseToCache);
        }
        return networkResponse;
    }).catch(() => {
        // Si falla la red y no hay cache, devolver error
        return cachedResponse || new Response('Offline', { status: 503 });
    });
    
    // Devolver cache inmediatamente si existe, sino esperar a la red
    return cachedResponse || fetchPromise;
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                console.log('[Service Worker] All caches cleared');
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

// Notificar al cliente cuando hay una actualización disponible
self.addEventListener('controllerchange', () => {
    console.log('[Service Worker] Controller changed - new version active');
});

// ============================================
// FIREBASE CLOUD MESSAGING - PUSH NOTIFICATIONS
// ============================================

// Initialize Firebase in Service Worker
firebase.initializeApp({
    apiKey: "AIzaSyA_EJRI7BIyHxSgMg5V8sQqndp_-v-t_C0",
    authDomain: "blockchaincontract001.firebaseapp.com",
    databaseURL: "https://blockchaincontract001-default-rtdb.firebaseio.com",
    projectId: "blockchaincontract001",
    storageBucket: "blockchaincontract001.firebasestorage.app",
    messagingSenderId: "949285642052",
    appId: "1:949285642052:web:7b0f7c0106ffd59f39c111"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[Service Worker] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Ant Pool';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/assets/web-app-manifest-192x192.png',
        badge: '/assets/favicon-96x96.png',
        tag: payload.data?.type || 'general',
        data: payload.data || {},
        vibrate: [200, 100, 200],
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: 'Open',
                icon: '/assets/favicon-96x96.png'
            },
            {
                action: 'close',
                title: 'Dismiss'
            }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event);
    
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Open app when notification is clicked
    const urlToOpen = event.notification.data?.click_action || '/app.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes('/app.html') && 'focus' in client) {
                        return client.focus().then(() => {
                            // Navigate to specific fund if provided
                            if (event.notification.data?.fundId) {
                                client.postMessage({
                                    type: 'NAVIGATE_TO_FUND',
                                    fundId: event.notification.data.fundId
                                });
                            }
                            return client;
                        });
                    }
                }
                
                // App not open, open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
