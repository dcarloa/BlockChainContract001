# 🔥 Firebase Setup Guide - Hybrid Mode

This guide will help you complete the Firebase configuration to enable Simple Mode in Ant Pool.

## Prerequisites

- Firebase project already exists: `blockchaincontract001`
- Firebase hosting already configured
- Need to enable: Authentication and Realtime Database

## Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `blockchaincontract001`
3. Click "Authentication" in left sidebar
4. Click "Get Started" if first time
5. Go to "Sign-in method" tab
6. Enable the following providers:
   - **Google**: Click Google → Enable → Save
   - **Email/Password**: Click Email/Password → Enable → Save

## Step 2: Enable Realtime Database

1. In Firebase Console, click "Realtime Database" in left sidebar
2. Click "Create Database"
3. Select location: `us-central1` (or your preferred location)
4. Start in **test mode** for now (we'll deploy rules later)
5. Click "Enable"

## Step 3: Get Firebase Configuration

1. In Firebase Console, click ⚙️ (Settings) → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app (if not already added)
4. Register app with nickname: "Ant Pool Web"
5. Copy the `firebaseConfig` object

## Step 4: Update firebase-config.js

Open `frontend/firebase-config.js` and replace the configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",                    // Replace with your API key
    authDomain: "blockchaincontract001.firebaseapp.com",
    databaseURL: "https://blockchaincontract001-default-rtdb.firebaseio.com",
    projectId: "blockchaincontract001",
    storageBucket: "blockchaincontract001.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",       // Replace with your sender ID
    appId: "YOUR_APP_ID"                       // Replace with your app ID
};
```

**Your actual config will look like:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...",
    authDomain: "blockchaincontract001.firebaseapp.com",
    databaseURL: "https://blockchaincontract001-default-rtdb.firebaseio.com",
    projectId: "blockchaincontract001",
    storageBucket: "blockchaincontract001.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456"
};
```

## Step 5: Deploy Database Rules

Run this command to deploy the security rules:

```powershell
firebase deploy --only database
```

This will deploy the rules from `database.rules.json` which ensure:
- Users can only access groups they're members of
- Users can only edit their own data
- Group creators have admin privileges

## Step 6: Test the Setup

1. Deploy to Firebase hosting:
   ```powershell
   firebase deploy --only hosting
   ```

2. Open your app: https://blockchaincontract001.web.app

3. Try creating a group:
   - Select "Simple Mode"
   - Click "Create Group"
   - You should see the sign-in modal
   - Sign in with Google or create email account
   - Group should be created successfully

## Step 7: Verify Database Structure

After creating your first Simple Mode group, check Firebase Console → Realtime Database.

You should see structure like:

```
blockchaincontract001-default-rtdb
├── groups/
│   └── grp_1234567890_abc123/
│       ├── id: "grp_1234567890_abc123"
│       ├── name: "Test Group"
│       ├── mode: "simple"
│       ├── createdBy: "user_uid_123"
│       ├── members/
│       │   └── user_uid_123/
│       │       ├── email: "user@example.com"
│       │       └── role: "creator"
│       ├── expenses: {}
│       └── settlements: {}
└── users/
    └── user_uid_123/
        └── groups/
            └── grp_1234567890_abc123/
                ├── name: "Test Group"
                └── role: "creator"
```

## Troubleshooting

### Error: "Firebase not initialized"

**Cause:** Firebase configuration is missing or incorrect.

**Solution:**
1. Check `firebase-config.js` has correct API keys
2. Make sure Firebase SDK scripts are loaded in `app.html`
3. Check browser console for specific errors

### Error: "Permission denied"

**Cause:** Database rules not deployed or user not authenticated.

**Solution:**
1. Deploy database rules: `firebase deploy --only database`
2. Make sure user is signed in before creating groups
3. Check Firebase Console → Realtime Database → Rules

### Google Sign-In not working

**Cause:** Google provider not enabled or domain not authorized.

**Solution:**
1. Firebase Console → Authentication → Sign-in method → Google → Enable
2. Add your domain to authorized domains:
   - `blockchaincontract001.web.app`
   - `localhost` (for testing)

### Database location mismatch

**Cause:** Wrong database URL in config.

**Solution:**
1. Check Firebase Console → Realtime Database
2. Copy the exact database URL
3. Update `databaseURL` in `firebase-config.js`

## Security Notes

- The current rules allow authenticated users to read/write their own data
- Group data is only accessible to group members
- Consider adding rate limiting in production
- Never commit `firebase-config.js` with real API keys to public repositories (though Firebase API keys are safe to expose for web apps)

## Next Steps

After Firebase is working:

1. ✅ Test Simple Mode group creation
2. ✅ Test expense tracking features
3. ✅ Test balance calculations
4. ✅ Test settlement recording
5. 🚀 Test migration to Blockchain Mode (coming soon)

## File Changes Summary

**New Files Created:**
- ✅ `frontend/firebase-config.js` - Firebase initialization and helpers
- ✅ `frontend/mode-manager.js` - Hybrid mode management
- ✅ `database.rules.json` - Security rules for Realtime Database

**Modified Files:**
- ✅ `frontend/app.html` - Added mode selector UI and Firebase SDK
- ✅ `frontend/app-platform.js` - Integrated mode detection and routing
- ✅ `frontend/styles-platform.css` - Added mode selector and sign-in styles
- ✅ `firebase.json` - Added database rules reference

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console logs
3. Verify all steps above were completed
4. Test with a fresh incognito browser window

---

**Status:** 🎯 Ready to configure Firebase API keys and test!

The hybrid mode architecture is complete. Once you add the Firebase configuration, users will be able to:
- Create groups without wallets (Simple Mode)
- Track expenses like a shared expense app
- Approve expenses with group voting
- Calculate and settle balances
- Later upgrade to Blockchain Mode for automatic payments
