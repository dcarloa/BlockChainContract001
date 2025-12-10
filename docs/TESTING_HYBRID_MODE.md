# 🧪 Testing Guide - Hybrid Mode

## ✅ What's Live Now

Your app is now deployed with **hybrid mode** at: https://blockchaincontract001.web.app

## 🎯 Features to Test

### 1. Simple Mode (No Wallet Needed)

**Step 1: Create Simple Mode Group**
1. Open https://blockchaincontract001.web.app
2. Click "Create New Group" button
3. **Select "Simple Mode"** (first card)
4. Fill in group details:
   - Name: "Weekend Trip"
   - Description: "Beach vacation expenses"
   - Budget: 1000 (in USD)
   - Keep other defaults
5. Click "Create Group"
6. You'll see sign-in modal appear

**Step 2: Sign In**
- **Option A:** Click "Continue with Google"
- **Option B:** Click "Sign in with Email" → Create account

**Step 3: Verify Group Created**
- You should see your new group in dashboard
- Badge should show "📝 Simple" 
- Balance shows in USD ($)
- No wallet connection needed!

### 2. Blockchain Mode (Wallet Required)

**Step 1: Connect Wallet**
1. Make sure MetaMask is installed
2. Switch to Base Sepolia network
3. Click "Connect Wallet"

**Step 2: Create Blockchain Mode Group**
1. Click "Create New Group"
2. **Select "Blockchain Mode"** (second card)
3. Fill in details
4. Approve transaction in MetaMask
5. Wait for confirmation

**Step 3: Verify Group Created**
- Group appears with "⛓️ Blockchain" badge
- Balance shows in ETH
- Full smart contract features available

### 3. Viewing Both Modes Together

**Test Dashboard:**
- Create one Simple Mode group
- Create one Blockchain Mode group
- Both should appear in your dashboard
- Each has its mode badge
- Different currency displays ($ vs ETH)

## 🔍 What to Look For

### Visual Indicators

✅ **Mode Badges:**
- Simple Mode: Green gradient "📝 Simple"
- Blockchain Mode: Purple gradient "⛓️ Blockchain"

✅ **Currency Display:**
- Simple: $100.00
- Blockchain: 0.05 ETH

✅ **Group Cards:**
- Both types show in same dashboard
- Stats adjust based on mode
- Click to open either type

### Sign-In Experience

✅ **Google Sign-In:**
- Opens Google authentication popup
- Returns to app after auth
- Group creates immediately

✅ **Email Sign-In:**
- Form appears for email/password
- Can create new account
- Validates password strength (min 6 chars)

## 🐛 Known Limitations (To Be Implemented)

### Simple Mode Features Not Yet Built:
- ❌ Adding expenses (UI not built yet)
- ❌ Approving expenses (UI not built yet)
- ❌ Viewing balances calculation (UI not built yet)
- ❌ Recording settlements (UI not built yet)
- ❌ Inviting members (UI not built yet)

**Current Status:** You can CREATE Simple Mode groups, but detailed management UI is coming next.

### Migration Feature:
- ❌ Upgrade Simple → Blockchain (placeholder only)

## 🎨 Current Capabilities

### ✅ What Works Now:

**Authentication:**
- ✅ Google sign-in
- ✅ Email/password sign-in
- ✅ Account creation
- ✅ Persistent sessions

**Group Management:**
- ✅ Create Simple Mode groups (Firebase)
- ✅ Create Blockchain Mode groups (Smart contracts)
- ✅ Load both types in dashboard
- ✅ Mode detection and routing
- ✅ Visual mode indicators

**Backend:**
- ✅ Firebase Realtime Database configured
- ✅ Security rules deployed
- ✅ Mode Manager initialized
- ✅ Hybrid architecture ready

## 📋 Next Steps

### Phase 2: Simple Mode Management UI

To complete Simple Mode, we need to build:

1. **Expense Management:**
   - Add expense button and form
   - Expense list view
   - Amount, description, who paid
   - Split between members selector

2. **Approval Workflow:**
   - Pending expenses list
   - Approve/Reject buttons
   - 60% threshold calculation
   - Status updates

3. **Balance Calculations:**
   - Who owes whom view
   - Running balances
   - Settlement suggestions
   - Payment tracking

4. **Member Management:**
   - Invite by email
   - Member list
   - Permissions

Would you like me to continue building these features?

## 🔧 Troubleshooting

### "Firebase not initialized"
- Check browser console for errors
- Verify firebase-config.js has correct API keys
- Reload page

### Google Sign-In doesn't work
- Check if popup was blocked
- Allow popups for blockchaincontract001.web.app
- Try again

### Group not appearing
- Refresh page (F5)
- Check if you're signed in (for Simple Mode)
- Check if wallet connected (for Blockchain Mode)

### Mode badge not showing
- Hard refresh (Ctrl+F5)
- Clear browser cache
- Check if CSS loaded properly

## 📊 Firebase Console Checks

Check your Firebase Console to verify:

1. **Authentication:**
   - Go to Authentication → Users
   - You should see your test account

2. **Database:**
   - Go to Realtime Database → Data
   - You should see `groups/` and `users/` nodes
   - Your test group should be there

3. **Rules:**
   - Go to Realtime Database → Rules
   - Rules should be deployed

## 🎉 Success Criteria

You've successfully tested when:

✅ Can create Simple Mode group without wallet  
✅ Can sign in with Google or email  
✅ Simple Mode group appears in dashboard with badge  
✅ Can create Blockchain Mode group with wallet  
✅ Both modes show correctly in same dashboard  
✅ Currency displays correctly per mode  
✅ Firebase user and group data visible in console  

---

**Ready for Phase 2?** Let me know if you want to continue building the expense management UI for Simple Mode!
