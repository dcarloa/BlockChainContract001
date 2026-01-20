# 🧪 Testing Guide - Colonia Viva System

## 🚀 Quick Testing Steps

### 1. Access the App
Visit: https://blockchaincontract001.web.app

### 2. Create a Test Group
1. Sign in (Simple Mode)
2. Create a new group in Simple Mode
3. Add at least one expense

### 3. Test Colony Display

#### Method A: Wait for Colony to Initialize
The colony will automatically appear in the group header after first activity.

#### Method B: Create Test Chest Manually
Open browser console (F12) and run:

```javascript
// Create a test chest for the current group
// Replace 'GROUP_ID' with your actual group ID
await ColonySystem.createTestChest('GROUP_ID', 'active');

// Then reload the group to see the banner
location.reload();
```

### 4. Test Weekly Chest Opening

Once a chest appears (banner at top of group):
1. Click "Abrir Cofre" button
2. Modal should open showing:
   - Colony visual (SVG animation)
   - Colony state name
   - Motivational description
3. Click to close - chest is marked as opened

### 5. Trigger Manual Evaluation (Admin)

In browser console:

```javascript
// Trigger evaluation for all groups
const result = await ColonySystem.triggerWeeklyEvaluation();
console.log(result);

// Force recreate chests even if they exist
const result = await ColonySystem.triggerWeeklyEvaluation(true);
```

## 🎯 Testing Scenarios

### Scenario 1: New Group (Forming State)
1. Create fresh group
2. Add 1 expense
3. Check colony display in header - should show 🥚 "Forming"
4. Create test chest: `ColonySystem.createTestChest(groupId, 'forming')`

### Scenario 2: Active Colony
1. Use group with 3-7 weeks of activity
2. Or manually set: `ColonySystem.createTestChest(groupId, 'active')`
3. Should show 🐜 "Active" with green-blue colors

### Scenario 3: Stable Colony
1. Use group with 8-15 weeks
2. Or: `ColonySystem.createTestChest(groupId, 'stable')`
3. Should show 🏘️ "Stable" with blue-purple colors

### Scenario 4: Consolidated Colony
1. Use group with 16+ weeks
2. Or: `ColonySystem.createTestChest(groupId, 'consolidated')`
3. Should show 🏛️ "Consolidated" with purple-gold colors

## 🔍 Debugging

### Check Feature Flag
```javascript
console.log('Colony enabled?', window.COLONY_FEATURE_ENABLED);
```

### Check if Colony System Loaded
```javascript
console.log('ColonySystem:', typeof ColonySystem);
console.log('Available functions:', Object.keys(ColonySystem));
```

### View Colony Data for Group
```javascript
const groupId = 'YOUR_GROUP_ID';
const colonyData = await ColonySystem.getColonyData(groupId);
console.log('Colony data:', colonyData);
```

### View Weekly Chests
```javascript
const groupId = 'YOUR_GROUP_ID';
const weekId = ColonySystem.getCurrentWeekId();
const chest = await ColonySystem.getWeeklyChest(groupId, weekId);
console.log('Week:', weekId, 'Chest:', chest);
```

### Check Firebase Database Directly
Open Firebase Console → Realtime Database:
- `/groups/{groupId}/colony` - Colony state
- `/weeklyChests/{groupId}/{weekId}` - Weekly chests

## 📊 Cloud Function Testing

### View Function Logs
```bash
firebase functions:log --only evaluateWeeklyChests
firebase functions:log --only evaluateWeeklyChestsManual
```

### Test Scheduled Function Locally
```bash
# In functions directory
cd functions
npm run serve

# Then trigger manually from another terminal
firebase functions:shell
evaluateWeeklyChests()
```

### Check Scheduler Status
Firebase Console → Functions → evaluateWeeklyChests
- Should be scheduled for "0 0 * * 1" (Every Monday midnight UTC)

## ✅ Validation Checklist

- [ ] Colony visual appears in group header
- [ ] Colony changes color based on state
- [ ] Weekly chest banner appears when chest exists
- [ ] Banner only shows once (disappears after opening)
- [ ] Modal shows correct colony state
- [ ] Modal close button works
- [ ] Clicking outside modal closes it
- [ ] Feature flag disables system when set to false
- [ ] Mobile responsive (test on phone)
- [ ] Light/dark theme support works
- [ ] No console errors
- [ ] Firebase rules allow member access only

## 🐛 Common Issues

### Issue: Colony doesn't appear
**Solution:** 
- Check if group has any activity (expenses)
- Verify feature flag: `window.COLONY_FEATURE_ENABLED`
- Check console for errors

### Issue: Chest banner doesn't show
**Solution:**
- Create test chest manually
- Check if chest already opened: Firebase DB → `weeklyChests/.../isOpened`
- Verify current week ID matches

### Issue: Modal doesn't open
**Solution:**
- Check if modal element exists: `document.getElementById('weeklyChestModal')`
- Verify colony-styles.css is loaded
- Check for JavaScript errors in console

### Issue: Cloud Function not running
**Solution:**
- Check function logs: `firebase functions:log`
- Verify function is deployed: Firebase Console → Functions
- Check scheduler configuration

## 🎨 Visual Testing

### Colony States Visual Reference

**Forming (🥚):**
- Small embryo/egg shape
- Orange-yellow gradient
- Soft glow animation

**Active (🐜):**
- Small colony with visible ants
- Green-blue gradient
- Pulse animation

**Stable (🏘️):**
- Organized colony with tunnels
- Blue-purple gradient
- Subtle movement

**Consolidated (🏛️):**
- Majestic colony structure
- Purple-gold gradient
- Shimmering effect

## 📱 Mobile Testing

1. Open on mobile device
2. Navigate to group
3. Verify:
   - Colony visual scales properly
   - Banner is readable
   - Modal fits screen
   - Touch interactions work
   - Animations perform smoothly

## 🔐 Security Testing

### Test Access Control
1. Try accessing another user's group colony data
2. Verify Firebase rules reject unauthorized access
3. Test with unauthenticated user

### Test Data Validation
1. Try creating invalid chest data
2. Verify Firebase rules enforce schema
3. Test XSS prevention in descriptions

## 📈 Performance Testing

1. Open group with many expenses
2. Monitor network tab (F12) for:
   - Colony data loads quickly (< 500ms)
   - No unnecessary Firebase reads
   - SVG renders smoothly
3. Check memory usage with DevTools

## 🎯 Next Steps After Testing

1. **Gather Feedback:** Share with beta users
2. **Monitor Metrics:** Check Firebase Analytics for engagement
3. **Iterate:** Based on user behavior
4. **Add Features:** Notifications, achievements, etc.

---

**Need Help?**
- Check Firebase Console logs
- Review COLONY_SYSTEM.md documentation
- Inspect browser console for errors
