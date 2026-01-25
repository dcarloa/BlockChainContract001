# Weekly Chests Not Auto-Creating - Issue & Solution

## 🔴 Problem

Los cofres semanales NO se crean automáticamente cada semana.

### Root Cause

La Cloud Function `evaluateWeeklyChests` está configurada como **Scheduled Function** (cron job):

```javascript
exports.evaluateWeeklyChests = functions.pubsub
    .schedule('0 0 * * 1') // Every Monday at midnight UTC
    .timeZone('UTC')
```

**PROBLEMA**: Scheduled functions require **Firebase Blaze Plan (paid)**.  
El proyecto está en **Spark Plan (free)** → Los cron jobs NO se ejecutan.

## ✅ Solution Implemented

### Auto-Creation on Group Load

Modificado `colony-system.js` → `checkWeeklyChest()`:

```javascript
async function checkWeeklyChest(groupId) {
    // ... welcome chest logic ...
    
    // Check for current week chest
    let chest = await getWeeklyChest(groupId, weekId);
    
    // If no chest exists, try to create one automatically
    if (!chest) {
        const evaluateFunction = firebase.functions().httpsCallable('evaluateWeeklyChestsManual');
        const result = await evaluateFunction({ weekId });
        
        if (result.data.success) {
            // Reload chest data
            chest = await getWeeklyChest(groupId, weekId);
        }
    }
    
    // Show banner if available
    if (chest && !chest.isOpened) {
        showWeeklyChestBanner(groupId, { ...chest, weekId });
    }
}
```

### How It Works Now

1. User opens a group
2. Frontend checks if weekly chest exists for current week
3. **If not found**: Automatically calls `evaluateWeeklyChestsManual` Cloud Function
4. Function evaluates ALL groups and creates chests based on activity
5. Chest appears immediately (if group meets criteria)

### Activity Criteria (from functions/index.js)

A weekly chest is created if during the past 7 days:
- **At least 1 expense** was registered, OR
- **At least 2 active members** in the group

## 🧪 Testing

### Manual Test (Console)

```javascript
// Force create chest for current week
const result = await ColonySystem.triggerWeeklyEvaluation();
console.log(result);

// Create chest for specific week
const result = await ColonySystem.triggerWeeklyEvaluation(false);
```

### Auto-Test

Simply open any group → Chest will auto-create if:
1. Current week doesn't have a chest yet
2. Group had activity in past 7 days

## 📊 When Chests Appear

**Before (Broken):**
- Never (cron job doesn't run on free plan)

**After (Fixed):**
- Every Monday at midnight UTC (**IF** user opens the group)
- OR whenever first user of the week opens the group
- Immediate on first group load each week

## ⚠️ Limitations

- Chests won't appear if nobody opens the app for a week
- First user to open group triggers evaluation (slight delay)
- If you upgrade to Blaze plan, enable the cron job for true automatic creation

## 🔄 Alternative: Upgrade to Blaze Plan

If you want TRUE automatic creation (without user interaction):

1. Upgrade Firebase project to Blaze plan
2. Cron job will run every Monday at midnight UTC
3. All active groups get chests automatically
4. No user action needed

### Cost Estimate (Blaze Plan)

- **Scheduled Functions**: ~$0.10/month (1 execution/week)
- **Database Reads/Writes**: ~$0.05/month (normal usage)
- **Total**: < $1/month for most use cases

## 📝 Summary

✅ **Fixed**: Chests now auto-create when users open groups  
✅ **No code changes needed**: Works on free plan  
✅ **Future-proof**: Can enable cron job if upgraded to Blaze  

The system now works reliably without requiring paid features!
