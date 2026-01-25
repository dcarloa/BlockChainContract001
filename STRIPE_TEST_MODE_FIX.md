# Stripe Test Mode Configuration Fix

## Problem
User attempted to test payments with test credit card (4242 4242 4242 4242) but received error:

```
Your card was declined.
Your request was in live mode, but used a known test card.
```

This indicates Firebase Functions are configured with **LIVE mode Stripe keys** instead of **TEST mode keys**.

## Current Configuration (LIVE MODE)
```bash
# Currently set (production keys)
stripe.secret_key = "sk_live_..."
stripe.publishable_key = "pk_live_..."
stripe.webhook_secret = "whsec_..."
```

## Fix: Switch to TEST Mode

### Step 1: Get Test Mode Keys from Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Test mode** keys (not Live mode)
   - Secret key: `sk_test_...`
   - Publishable key: `pk_test_...`

### Step 2: Get Test Webhook Secret
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Copy "Signing secret" (starts with `whsec_`)

### Step 3: Configure Firebase Functions
```bash
# Set TEST mode Stripe keys
firebase functions:config:set stripe.secret_key="sk_test_YOUR_TEST_SECRET_KEY_HERE"
firebase functions:config:set stripe.publishable_key="pk_test_YOUR_TEST_PUBLISHABLE_KEY_HERE"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_TEST_WEBHOOK_SECRET_HERE"
```

### Step 4: Update Frontend publishable key
Edit `frontend/firebase-credentials.js`:
```javascript
// Change from:
publishableKey: 'pk_live_...'

// To:
publishableKey: 'pk_test_...'
```

### Step 5: Deploy Changes
```bash
# Deploy functions with new configuration
firebase deploy --only functions

# Deploy hosting if you updated firebase-credentials.js
firebase deploy --only hosting
```

### Step 6: Test with Test Card
Now you can use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

See all test cards: https://stripe.com/docs/testing#cards

## Important Notes

⚠️ **WARNING**: Do NOT commit real Stripe keys to git repository!

✅ **Best Practice**: Use different Stripe accounts for test vs production:
- Test account: For development and testing
- Live account: For real customer payments

🔄 **Switching Back to Live Mode**: When ready for production, repeat steps with LIVE mode keys (`sk_live_...`, `pk_live_...`)

## Verification
After deploying, test the subscription flow:
1. Set `LAUNCH_MODE = false` in subscription-manager.js
2. Attempt to upgrade with test card 4242 4242 4242 4242
3. Should successfully redirect to Stripe Checkout
4. Complete payment (no actual charge in test mode)
5. Should redirect back to app with PRO status

## Current Status
- ❌ Functions configured with LIVE mode keys (blocking test cards)
- ⚠️ Need to update to TEST mode for safe testing
- 📋 Follow steps above to fix

## Related Files
- `functions/index.js` - Uses Stripe keys from Firebase config
- `frontend/firebase-credentials.js` - Contains publishable key
- `frontend/subscription-manager.js` - Handles upgrade flow
