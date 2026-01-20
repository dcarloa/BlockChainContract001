# 🐜 Colonia Viva - Deployment & Testing Commands

## 🚀 Deployment Commands

### Deploy Everything
```bash
firebase deploy --only "hosting,database,functions"
```

### Deploy Individual Components
```bash
# Frontend only
firebase deploy --only hosting

# Database rules only
firebase deploy --only database

# Cloud Functions only
firebase deploy --only functions

# Specific function only
firebase deploy --only functions:evaluateWeeklyChests
firebase deploy --only functions:evaluateWeeklyChestsManual
```

### Rollback Deployment
```bash
# List previous versions
firebase hosting:channel:list

# Deploy specific version
firebase hosting:rollback
```

---

## 🧪 Testing Commands

### Local Testing (Firebase Emulators)
```bash
# Start all emulators
firebase emulators:start

# Functions only
firebase emulators:start --only functions

# With import of production data
firebase emulators:start --import=./firebase-data --export-on-exit
```

### Function Testing
```bash
# View logs
firebase functions:log
firebase functions:log --only evaluateWeeklyChests
firebase functions:log --limit 50

# Shell (interactive testing)
cd functions
npm run shell

# Then in shell:
evaluateWeeklyChests()
evaluateWeeklyChestsManual({ forceRecreate: true })
```

### Database Commands
```bash
# Export database
firebase database:get / > backup.json

# Import database
firebase database:set / backup.json

# Get specific path
firebase database:get /groups/GROUP_ID/colony

# Update specific path
firebase database:update /groups/GROUP_ID/colony '{\"state\":\"active\"}'
```

---

## 🌐 Browser Testing Commands

Open browser console (F12) and run:

### Quick Status Check
```javascript
// Check if colony system loaded
console.log('Colony:', typeof ColonySystem);
console.log('Enabled:', window.COLONY_FEATURE_ENABLED);

// Check authentication
console.log('User:', firebase.auth().currentUser?.uid);
```

### Create Test Data
```javascript
// Get current group ID
const groupId = new URLSearchParams(location.search).get('fund') || currentFund.fundAddress;

// Create test chest for current week
await ColonySystem.createTestChest(groupId, 'active');
// Options: 'forming', 'active', 'stable', 'consolidated'

// Then reload to see banner
location.reload();
```

### Trigger Manual Evaluation
```javascript
// Evaluate all groups
const result = await ColonySystem.triggerWeeklyEvaluation();
console.table(result.results);

// Force recreate existing chests
const result = await ColonySystem.triggerWeeklyEvaluation(true);
```

### View Colony Data
```javascript
const groupId = 'YOUR_GROUP_ID';

// Get colony state
const colony = await ColonySystem.getColonyData(groupId);
console.log('Colony:', colony);

// Get weekly chest
const weekId = ColonySystem.getCurrentWeekId();
const chest = await ColonySystem.getWeeklyChest(groupId, weekId);
console.log('Chest:', chest);

// Get all chests for group
firebase.database().ref(`weeklyChests/${groupId}`).once('value').then(s => {
  console.table(s.val());
});
```

### Load Test Suite
```javascript
// Manually load test suite if not included in page
const script = document.createElement('script');
script.src = 'colony-test-suite.js';
document.head.appendChild(script);

// Then use:
colonyTest.all()  // Run all tests
```

---

## 🔧 Development Commands

### Install Dependencies
```bash
# Root project
npm install

# Functions
cd functions
npm install
```

### Build & Watch
```bash
# If using build tools (currently not needed)
npm run build
npm run watch
```

### Code Quality
```bash
# Check for issues (if ESLint configured)
npm run lint

# Format code (if Prettier configured)
npm run format
```

---

## 📊 Monitoring Commands

### Firebase Console URLs
```bash
# Open project console
firebase open

# Open specific sections
firebase open hosting
firebase open functions
firebase open database
```

### Analytics
```javascript
// In browser console - log custom events
firebase.analytics().logEvent('colony_chest_opened', {
  group_id: 'GROUP_ID',
  colony_state: 'active'
});

firebase.analytics().logEvent('colony_state_upgraded', {
  group_id: 'GROUP_ID',
  from_state: 'forming',
  to_state: 'active'
});
```

---

## 🐛 Debugging Commands

### Clear Firebase Cache
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('firebaseLocalStorageDb');
location.reload();
```

### Check Firebase Connection
```javascript
// Test database connection
firebase.database().ref('.info/connected').on('value', snap => {
  console.log('Connected:', snap.val());
});

// Test auth state
firebase.auth().onAuthStateChanged(user => {
  console.log('Auth state:', user ? 'Logged in' : 'Logged out');
});
```

### View All Groups
```javascript
// Get all groups from database
firebase.database().ref('groups').once('value').then(snapshot => {
  const groups = snapshot.val();
  console.log('Total groups:', Object.keys(groups || {}).length);
  console.table(Object.entries(groups || {}).map(([id, data]) => ({
    id,
    name: data.name,
    mode: data.mode,
    members: Object.keys(data.members || {}).length
  })));
});
```

### Force Update Colony Display
```javascript
// For current group
const groupId = currentFund.fundAddress;
await ColonySystem.updateColonyDisplay(groupId);
await ColonySystem.checkWeeklyChest(groupId);
```

---

## 🔒 Security Testing

### Test Database Rules
```bash
# Run security rules tests (if configured)
firebase emulators:exec --only database "npm test"
```

### Test Unauthorized Access
```javascript
// Try accessing another user's data (should fail)
const otherGroupId = 'SOME_OTHER_GROUP_ID';
firebase.database().ref(`groups/${otherGroupId}/colony`).once('value')
  .then(() => console.log('❌ Security issue - access granted'))
  .catch(() => console.log('✅ Security working - access denied'));
```

---

## 📱 Mobile Testing

### Test on Device
```bash
# Get local IP for mobile testing
ipconfig  # Windows
ifconfig  # Mac/Linux

# Then access from mobile:
# http://YOUR_LOCAL_IP:5000 (if using emulators)
```

### Simulate Mobile in Chrome DevTools
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device (iPhone, Android, etc.)
4. Test responsive design

---

## 🚨 Emergency Commands

### Disable Colony Feature
```javascript
// In browser console (immediate effect)
window.COLONY_FEATURE_ENABLED = false;
location.reload();

// Or update in app-platform.js and redeploy
```

### Delete All Chests for Group
```javascript
const groupId = 'GROUP_ID';
await firebase.database().ref(`weeklyChests/${groupId}`).remove();
console.log('✅ All chests deleted');
```

### Reset Colony State
```javascript
const groupId = 'GROUP_ID';
await firebase.database().ref(`groups/${groupId}/colony`).remove();
console.log('✅ Colony reset');
```

---

## 📋 Pre-Deployment Checklist

Before deploying:
- [ ] Test locally with emulators
- [ ] Check for console errors
- [ ] Verify feature flag is correct
- [ ] Review Firebase rules
- [ ] Test on mobile device
- [ ] Check function logs for errors
- [ ] Backup database if needed
- [ ] Update documentation if changed

After deploying:
- [ ] Visit live site and test
- [ ] Check Firebase Console for errors
- [ ] Monitor function execution
- [ ] Test on different browsers
- [ ] Gather user feedback

---

## 🎯 Quick Reference

**Live Site:** https://blockchaincontract001.web.app

**Firebase Console:** https://console.firebase.google.com/project/blockchaincontract001

**Function Logs:**
```bash
firebase functions:log --limit 100
```

**Create Test Chest:**
```javascript
await ColonySystem.createTestChest(groupId, 'active')
```

**Run All Tests:**
```javascript
colonyTest.all()
```

---

**Need more help?** Check:
- `COLONY_SYSTEM.md` - Feature documentation
- `COLONY_TESTING_GUIDE.md` - Detailed testing guide
- `COLONY_DEPLOYMENT_SUMMARY.md` - Deployment summary
