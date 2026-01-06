const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function: Send push notification when a new notification is created
 * Triggers on new entries in /notifications/{userId}/{notificationId}
 */
exports.sendPushNotification = functions.database
    .ref('/notifications/{userId}/{notificationId}')
    .onCreate(async (snapshot, context) => {
        try {
            const userId = context.params.userId;
            const notificationId = context.params.notificationId;
            const notificationData = snapshot.val();

            console.log(`📬 New notification for user ${userId}:`, notificationData);

            // Get user's FCM tokens
            const tokensSnapshot = await admin.database()
                .ref(`/fcmTokens/${userId}`)
                .once('value');

            const tokens = tokensSnapshot.val();

            if (!tokens || Object.keys(tokens).length === 0) {
                console.log(`⚠️ User ${userId} has no FCM tokens registered`);
                return null;
            }

            // Prepare notification payload
            const payload = {
                notification: {
                    title: notificationData.title || 'Ant Pool',
                    body: notificationData.message || 'You have a new notification'
                },
                data: {
                    notificationId: notificationId,
                    type: notificationData.type || 'general',
                    fundId: notificationData.fundId || '',
                    expenseId: notificationData.expenseId || '',
                    timestamp: String(notificationData.timestamp || Date.now()),
                    click_action: notificationData.fundId 
                        ? `/app.html?fund=${notificationData.fundId}`
                        : '/app.html'
                }
            };

            // Send to all user's devices using FCM v1 API
            const tokenList = Object.keys(tokens);
            console.log(`📤 Sending to ${tokenList.length} device(s)`);

            // FCM v1 API requires sending to each token individually
            const sendPromises = tokenList.map(async (token) => {
                const message = {
                    token: token,
                    notification: payload.notification,
                    data: payload.data,
                    android: {
                        priority: 'high'
                    },
                    apns: {
                        headers: {
                            'apns-priority': '10'
                        }
                    },
                    webpush: {
                        headers: {
                            'TTL': '86400' // 24 hours
                        }
                    }
                };

                try {
                    await admin.messaging().send(message);
                    return { success: true, token };
                } catch (error) {
                    console.error(`❌ Error sending to token ${token}:`, error.code);
                    return { success: false, token, error: error.code };
                }
            });

            const results = await Promise.all(sendPromises);
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            console.log(`✅ Successfully sent notification. Results:`, {
                success: successCount,
                failure: failureCount
            });

            // Remove invalid tokens
            const invalidTokens = results
                .filter(r => !r.success && (
                    r.error === 'messaging/invalid-registration-token' ||
                    r.error === 'messaging/registration-token-not-registered'
                ))
                .map(r => r.token);

            // Clean up invalid tokens
            if (invalidTokens.length > 0) {
                console.log(`🧹 Removing ${invalidTokens.length} invalid token(s)`);
                const updates = {};
                invalidTokens.forEach(token => {
                    updates[`/fcmTokens/${userId}/${token}`] = null;
                });
                await admin.database().ref().update(updates);
            }

            return null;

        } catch (error) {
            console.error('❌ Error in sendPushNotification:', error);
            return null;
        }
    });

/**
 * Cloud Function: Clean up old notifications (keep last 100 per user)
 * Runs daily at midnight
 */
exports.cleanupOldNotifications = functions.pubsub
    .schedule('0 0 * * *')
    .timeZone('America/Mexico_City')
    .onRun(async (context) => {
        try {
            console.log('🧹 Starting notification cleanup...');

            const usersSnapshot = await admin.database()
                .ref('/notifications')
                .once('value');

            const users = usersSnapshot.val() || {};
            let totalCleaned = 0;

            for (const [userId, notifications] of Object.entries(users)) {
                const notifArray = Object.entries(notifications)
                    .map(([id, data]) => ({ id, timestamp: data.timestamp || 0 }))
                    .sort((a, b) => b.timestamp - a.timestamp);

                // Keep only last 100
                if (notifArray.length > 100) {
                    const toDelete = notifArray.slice(100);
                    const updates = {};
                    
                    toDelete.forEach(notif => {
                        updates[`/notifications/${userId}/${notif.id}`] = null;
                    });

                    await admin.database().ref().update(updates);
                    totalCleaned += toDelete.length;
                    
                    console.log(`🗑️ Cleaned ${toDelete.length} notifications for user ${userId}`);
                }
            }

            console.log(`✅ Cleanup complete. Removed ${totalCleaned} old notifications`);
            return null;

        } catch (error) {
            console.error('❌ Error in cleanupOldNotifications:', error);
            return null;
        }
    });
