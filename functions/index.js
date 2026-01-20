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
            // FCM v1 requires all data values to be strings
            const data = {};
            if (notificationId) data.notificationId = String(notificationId);
            if (notificationData.type) data.type = String(notificationData.type);
            if (notificationData.fundId) data.fundId = String(notificationData.fundId);
            if (notificationData.expenseId) data.expenseId = String(notificationData.expenseId);
            data.timestamp = String(notificationData.timestamp || Date.now());
            if (notificationData.fundId) {
                data.click_action = `/app.html?fund=${notificationData.fundId}`;
            }

            const payload = {
                notification: {
                    title: notificationData.title || 'Ant Pool',
                    body: notificationData.message || 'You have a new notification'
                },
                data: data
            };

            // Send to all user's devices using FCM v1 API
            // Keep both sanitized key (for DB operations) and real token (for FCM send)
            const tokenData = Object.keys(tokens).map(key => ({
                key: key,                    // Sanitized key (no special chars)
                token: tokens[key].token     // Real FCM token (with colon)
            }));
            console.log(`📤 Sending to ${tokenData.length} device(s)`);

            // FCM v1 API requires sending to each token individually
            const sendPromises = tokenData.map(async ({ key, token }) => {
                const message = {
                    token: token,  // Use real token for FCM
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
                    return { success: true, key, token };
                } catch (error) {
                    console.error(`❌ Error sending to token ${token}:`, error.code);
                    return { success: false, key, token, error: error.code };
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
                .map(r => r.key);  // Use sanitized key for DB path

            // Clean up invalid tokens
            if (invalidTokens.length > 0) {
                console.log(`🧹 Removing ${invalidTokens.length} invalid token(s)`);
                const updates = {};
                invalidTokens.forEach(key => {
                    updates[`/fcmTokens/${userId}/${key}`] = null;  // Use sanitized key
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

/**
 * Cloud Function: Handle Stripe webhooks for subscription management
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const stripe = require('stripe')(functions.config().stripe?.secret_key);
    const endpointSecret = functions.config().stripe?.webhook_secret;

    if (!stripe || !endpointSecret) {
        console.error('❌ Stripe not configured');
        return res.status(500).send('Stripe configuration missing');
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`📧 Stripe event received: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const customerId = session.customer;
                const subscriptionId = session.subscription;
                const clientEmail = session.customer_details?.email;

                // Find user by email
                const usersSnapshot = await admin.database()
                    .ref('/users')
                    .orderByChild('email')
                    .equalTo(clientEmail)
                    .once('value');

                if (usersSnapshot.exists()) {
                    const userData = usersSnapshot.val();
                    const userId = Object.keys(userData)[0];

                    await admin.database().ref(`/users/${userId}/subscription`).set({
                        status: 'active',
                        plan: 'pro',
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscriptionId,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    });

                    console.log(`✅ Subscription activated for user ${userId}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                // Find user by customerId
                const usersSnapshot = await admin.database()
                    .ref('/users')
                    .orderByChild('subscription/stripeCustomerId')
                    .equalTo(customerId)
                    .once('value');

                if (usersSnapshot.exists()) {
                    const userData = usersSnapshot.val();
                    const userId = Object.keys(userData)[0];

                    await admin.database().ref(`/users/${userId}/subscription`).update({
                        status: subscription.status,
                        currentPeriodEnd: subscription.current_period_end * 1000,
                        updatedAt: Date.now()
                    });

                    console.log(`✅ Subscription updated for user ${userId}: ${subscription.status}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                const usersSnapshot = await admin.database()
                    .ref('/users')
                    .orderByChild('subscription/stripeCustomerId')
                    .equalTo(customerId)
                    .once('value');

                if (usersSnapshot.exists()) {
                    const userData = usersSnapshot.val();
                    const userId = Object.keys(userData)[0];

                    await admin.database().ref(`/users/${userId}/subscription`).set({
                        status: 'cancelled',
                        plan: 'free',
                        cancelledAt: Date.now()
                    });

                    console.log(`✅ Subscription cancelled for user ${userId}`);
                }
                break;
            }

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).send('Webhook processing failed');
    }
});

/**
 * Cloud Function: Create Stripe Checkout Session
 * Creates a new checkout session for PRO subscription
 */
exports.createStripeCheckoutSession = functions.https.onCall(async (data, context) => {
    try {
        console.log('🔵 createStripeCheckoutSession called with data:', data);
        
        // Check if user is authenticated
        if (!context.auth) {
            console.error('❌ User not authenticated');
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated'
            );
        }

        const { customerEmail, successUrl, cancelUrl } = data;

        if (!customerEmail) {
            console.error('❌ Customer email missing');
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Customer email is required'
            );
        }

        const stripe = require('stripe')(functions.config().stripe.secret_key);

        // Get the price ID from your Stripe product
        const priceId = 'price_1SmMb0B6L1CVc8RDGEi8cqVQ'; // PRO Monthly $4.99/month

        console.log(`🔵 Creating checkout session for ${customerEmail} with price ${priceId}`);

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: customerEmail,
            success_url: successUrl || 'https://blockchaincontract001.web.app/app.html?payment=success',
            cancel_url: cancelUrl || 'https://blockchaincontract001.web.app/app.html?payment=cancelled',
            metadata: {
                userId: context.auth.uid,
                email: customerEmail
            }
        });

        console.log(`✅ Checkout session created: ${session.id}`);
        console.log(`✅ Checkout URL: ${session.url}`);

        return { url: session.url };

    } catch (error) {
        console.error('❌ Error creating checkout session:', error);
        console.error('❌ Error details:', error.message);
        throw new functions.https.HttpsError(
            'internal',
            `Failed to create checkout session: ${error.message}`
        );
    }
});

/**
 * Cloud Function: Create Stripe Customer Portal session
 * Allows PRO users to manage their subscription
 */
exports.createStripePortalSession = functions.https.onCall(async (data, context) => {
    try {
        // Check if user is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated'
            );
        }

        const { customerId } = data;

        if (!customerId) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Customer ID is required'
            );
        }

        const stripe = require('stripe')(functions.config().stripe.secret_key);

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: 'https://blockchaincontract001.web.app/index.html'
        });

        console.log(`✅ Portal session created for customer ${customerId}`);

        return { url: session.url };

    } catch (error) {
        console.error('❌ Error creating portal session:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to create portal session'
        );
    }
});

/**
 * Cloud Function: Evaluate Weekly Chests for all active groups
 * Runs every Monday at 00:00 UTC
 * Creates weekly chests for groups that showed activity
 */
exports.evaluateWeeklyChests = functions.pubsub
    .schedule('0 0 * * 1') // Every Monday at midnight UTC
    .timeZone('UTC')
    .onRun(async (context) => {
        try {
            console.log('🐜 Starting weekly chest evaluation...');
            
            const db = admin.database();
            const now = Date.now();
            const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
            
            // Get current week ID (format: YYYY-Wxx)
            const date = new Date(now);
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            const weekId = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
            
            console.log(`📅 Creating chests for week: ${weekId}`);
            
            // Get all groups
            const groupsSnapshot = await db.ref('groups').once('value');
            const groups = groupsSnapshot.val();
            
            if (!groups) {
                console.log('⚠️ No groups found');
                return null;
            }
            
            let chestsCreated = 0;
            let groupsEvaluated = 0;
            
            // Evaluate each group
            for (const [groupId, groupData] of Object.entries(groups)) {
                try {
                    groupsEvaluated++;
                    
                    // Skip if not Simple Mode or inactive
                    if (groupData.mode !== 'simple' || groupData.isActive === false) {
                        continue;
                    }
                    
                    // Check if chest already exists for this week
                    const existingChest = await db.ref(`weeklyChests/${groupId}/${weekId}`).once('value');
                    if (existingChest.exists()) {
                        console.log(`⏭️ Chest already exists for ${groupId} week ${weekId}`);
                        continue;
                    }
                    
                    // Count activity in the past week
                    let weeklyExpenses = 0;
                    let activeMembersCount = 0;
                    const activeMembers = new Set();
                    
                    if (groupData.expenses) {
                        for (const expense of Object.values(groupData.expenses)) {
                            if (expense.createdAt && expense.createdAt >= oneWeekAgo) {
                                weeklyExpenses++;
                                if (expense.paidBy) {
                                    activeMembers.add(expense.paidBy);
                                }
                            }
                        }
                    }
                    
                    activeMembersCount = activeMembers.size;
                    
                    // Criteria: At least 1 expense OR at least 2 active members
                    const qualifiesForChest = weeklyExpenses >= 1 || activeMembersCount >= 2;
                    
                    if (!qualifiesForChest) {
                        console.log(`⏭️ Group ${groupId} doesn't qualify (expenses: ${weeklyExpenses}, active: ${activeMembersCount})`);
                        continue;
                    }
                    
                    // Get or initialize colony data
                    const colonySnapshot = await db.ref(`groups/${groupId}/colony`).once('value');
                    let colonyData = colonySnapshot.val() || {
                        state: 'forming',
                        totalActivity: 0,
                        consecutiveActiveWeeks: 0,
                        weeklyActivity: 0
                    };
                    
                    // Update colony stats
                    colonyData.totalActivity = (colonyData.totalActivity || 0) + weeklyExpenses;
                    colonyData.weeklyActivity = weeklyExpenses;
                    colonyData.consecutiveActiveWeeks = (colonyData.consecutiveActiveWeeks || 0) + 1;
                    colonyData.lastActivityDate = now;
                    colonyData.lastEvaluationDate = now;
                    
                    // Determine colony state based on consecutive weeks
                    const weeks = colonyData.consecutiveActiveWeeks;
                    if (weeks >= 16) {
                        colonyData.state = 'consolidated';
                    } else if (weeks >= 8) {
                        colonyData.state = 'stable';
                    } else if (weeks >= 3) {
                        colonyData.state = 'active';
                    } else {
                        colonyData.state = 'forming';
                    }
                    
                    // State descriptions
                    const stateDescriptions = {
                        forming: 'Tu colonia está naciendo. Las primeras hormigas exploran el terreno.',
                        active: 'Las hormigas trabajan juntas. La colonia muestra signos de organización.',
                        stable: 'Una comunidad organizada. Los túneles se expanden con propósito.',
                        consolidated: '¡Un imperio de cooperación! La colonia ha alcanzado su máximo esplendor.'
                    };
                    
                    // Create weekly chest
                    const chestData = {
                        state: colonyData.state,
                        description: stateDescriptions[colonyData.state],
                        createdAt: now,
                        isOpened: false,
                        weeklyExpenses: weeklyExpenses,
                        activeMembers: activeMembersCount,
                        consecutiveWeeks: colonyData.consecutiveActiveWeeks
                    };
                    
                    // Save to database
                    await db.ref(`weeklyChests/${groupId}/${weekId}`).set(chestData);
                    await db.ref(`groups/${groupId}/colony`).update(colonyData);
                    
                    chestsCreated++;
                    console.log(`✅ Created chest for ${groupId}: ${colonyData.state} (${weeks} weeks)`);
                    
                    // Optional: Create notification for group members
                    if (groupData.members) {
                        for (const memberId of Object.keys(groupData.members)) {
                            const notificationRef = db.ref(`notifications/${memberId}`).push();
                            await notificationRef.set({
                                type: 'weekly_chest',
                                title: '🐜 Cofre Semanal Disponible',
                                message: `Tu grupo "${groupData.name}" tiene un nuevo cofre semanal. ¡Ábrelo para ver el progreso de tu colonia!`,
                                timestamp: now,
                                fundId: groupId,
                                read: false
                            });
                        }
                    }
                    
                } catch (groupError) {
                    console.error(`❌ Error evaluating group ${groupId}:`, groupError);
                    // Continue with next group
                }
            }
            
            console.log(`✅ Weekly chest evaluation complete!`);
            console.log(`📊 Stats: ${groupsEvaluated} groups evaluated, ${chestsCreated} chests created`);
            
            return {
                success: true,
                groupsEvaluated,
                chestsCreated,
                weekId
            };
            
        } catch (error) {
            console.error('❌ Error in weekly chest evaluation:', error);
            throw error;
        }
    });

/**
 * Cloud Function: Manually trigger weekly chest evaluation (for testing)
 * Can be called from client or Admin panel
 */
exports.evaluateWeeklyChestsManual = functions.https.onCall(async (data, context) => {
    try {
        // Check if user is authenticated (optional - you can restrict to admins only)
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated'
            );
        }

        console.log(`🐜 Manual weekly chest evaluation triggered by user ${context.auth.uid}`);
        
        const db = admin.database();
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        // Get current week ID or use provided one
        const targetWeekId = data.weekId || (() => {
            const date = new Date(now);
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
        })();
        
        console.log(`📅 Creating chests for week: ${targetWeekId}`);
        
        // Get all groups
        const groupsSnapshot = await db.ref('groups').once('value');
        const groups = groupsSnapshot.val();
        
        if (!groups) {
            throw new functions.https.HttpsError('not-found', 'No groups found');
        }
        
        let chestsCreated = 0;
        let groupsEvaluated = 0;
        const results = [];
        
        // Evaluate each group
        for (const [groupId, groupData] of Object.entries(groups)) {
            try {
                groupsEvaluated++;
                
                // Skip if not Simple Mode or inactive
                if (groupData.mode !== 'simple' || groupData.isActive === false) {
                    results.push({ groupId, status: 'skipped', reason: 'not_simple_mode_or_inactive' });
                    continue;
                }
                
                // Check if chest already exists for this week
                const existingChest = await db.ref(`weeklyChests/${groupId}/${targetWeekId}`).once('value');
                if (existingChest.exists() && !data.forceRecreate) {
                    results.push({ groupId, status: 'skipped', reason: 'chest_exists' });
                    continue;
                }
                
                // Count activity
                let weeklyExpenses = 0;
                let activeMembersCount = 0;
                const activeMembers = new Set();
                
                if (groupData.expenses) {
                    for (const expense of Object.values(groupData.expenses)) {
                        if (expense.createdAt && expense.createdAt >= oneWeekAgo) {
                            weeklyExpenses++;
                            if (expense.paidBy) {
                                activeMembers.add(expense.paidBy);
                            }
                        }
                    }
                }
                
                activeMembersCount = activeMembers.size;
                
                // Criteria: At least 1 expense OR at least 2 active members
                const qualifiesForChest = weeklyExpenses >= 1 || activeMembersCount >= 2;
                
                if (!qualifiesForChest) {
                    results.push({ 
                        groupId, 
                        status: 'skipped', 
                        reason: 'insufficient_activity',
                        weeklyExpenses,
                        activeMembersCount
                    });
                    continue;
                }
                
                // Get or initialize colony data
                const colonySnapshot = await db.ref(`groups/${groupId}/colony`).once('value');
                let colonyData = colonySnapshot.val() || {
                    state: 'forming',
                    totalActivity: 0,
                    consecutiveActiveWeeks: 0,
                    weeklyActivity: 0
                };
                
                // Update colony stats
                colonyData.totalActivity = (colonyData.totalActivity || 0) + weeklyExpenses;
                colonyData.weeklyActivity = weeklyExpenses;
                colonyData.consecutiveActiveWeeks = (colonyData.consecutiveActiveWeeks || 0) + 1;
                colonyData.lastActivityDate = now;
                colonyData.lastEvaluationDate = now;
                
                // Determine state
                const weeks = colonyData.consecutiveActiveWeeks;
                if (weeks >= 16) {
                    colonyData.state = 'consolidated';
                } else if (weeks >= 8) {
                    colonyData.state = 'stable';
                } else if (weeks >= 3) {
                    colonyData.state = 'active';
                } else {
                    colonyData.state = 'forming';
                }
                
                const stateDescriptions = {
                    forming: 'Tu colonia está naciendo. Las primeras hormigas exploran el terreno.',
                    active: 'Las hormigas trabajan juntas. La colonia muestra signos de organización.',
                    stable: 'Una comunidad organizada. Los túneles se expanden con propósito.',
                    consolidated: '¡Un imperio de cooperación! La colonia ha alcanzado su máximo esplendor.'
                };
                
                // Create chest
                const chestData = {
                    state: colonyData.state,
                    description: stateDescriptions[colonyData.state],
                    createdAt: now,
                    isOpened: false,
                    weeklyExpenses: weeklyExpenses,
                    activeMembers: activeMembersCount,
                    consecutiveWeeks: colonyData.consecutiveActiveWeeks
                };
                
                await db.ref(`weeklyChests/${groupId}/${targetWeekId}`).set(chestData);
                await db.ref(`groups/${groupId}/colony`).update(colonyData);
                
                chestsCreated++;
                results.push({ 
                    groupId, 
                    status: 'created', 
                    state: colonyData.state,
                    weeks: weeks
                });
                
            } catch (groupError) {
                results.push({ groupId, status: 'error', error: groupError.message });
            }
        }
        
        console.log(`✅ Manual evaluation complete: ${chestsCreated} chests created`);
        
        return {
            success: true,
            groupsEvaluated,
            chestsCreated,
            weekId: targetWeekId,
            results
        };
        
    } catch (error) {
        console.error('❌ Error in manual evaluation:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});