# 🐜 Colonia Viva - Living Colony System

## Overview

**Colonia Viva** is a gamification system designed to increase user retention and engagement in Ant Pool without interfering with the financial logic. It creates a visual metaphor of an ant colony that grows and evolves based on group activity.

## Core Philosophy

- **Non-invasive**: Does not affect balances, expenses, or settlements
- **Visual-only**: Purely experiential and motivational
- **Retention-focused**: Encourages weekly engagement
- **Subtle**: Not pushy or annoying

## Features

### 1. Colony States

The colony evolves through 4 visual states based on activity:

#### 🥚 **Forming** (0-2 weeks active)
- **Visual**: Small embryo/egg with soft glow
- **Description**: "Tu colonia está naciendo"
- **Threshold**: < 3 weeks of activity
- **Color**: Warm orange-yellow gradients

#### 🐜 **Active** (3-7 weeks active)
- **Visual**: Small colony with visible ants
- **Description**: "Las hormigas trabajan juntas"
- **Threshold**: 3+ consecutive active weeks
- **Color**: Green-blue gradients

#### 🏘️ **Stable** (8-15 weeks active)
- **Visual**: Organized colony with tunnels
- **Description**: "Una comunidad organizada"
- **Threshold**: 8+ consecutive active weeks
- **Color**: Blue-purple gradients

#### 🏛️ **Consolidated** (16+ weeks active)
- **Visual**: Majestic colony with chambers
- **Description**: "Un imperio de cooperación"
- **Threshold**: 16+ consecutive active weeks
- **Color**: Purple-gold gradients

### 2. Weekly Chest System

Every week, if the group shows activity (expenses registered), a "Weekly Chest" is created:

- **Non-invasive Banner**: Shows at top of group view when available
- **Single Open**: Can only be opened once per week per group
- **Visual Reward**: Shows colony state and motivational message
- **No Financial Impact**: Purely experiential

#### Activity Criteria

A "weekly chest" is created if during the week:
- At least 1 expense was registered, OR
- At least 2 members were active in the group

## Technical Architecture

### Files

- **colony-system.js**: Core logic and rendering
- **colony-styles.css**: Visual styles and animations
- **database.rules.json**: Firebase security rules for colony data

### Firebase Structure

```
groups/
  {groupId}/
    colony/
      state: "forming" | "active" | "stable" | "consolidated"
      totalActivity: number (total expenses registered)
      weeklyActivity: number (expenses this week)
      consecutiveActiveWeeks: number
      lastActivityDate: timestamp
      lastEvaluationDate: timestamp

weeklyChests/
  {groupId}/
    {weekId}/  // Format: YYYY-Wxx (e.g., 2024-W15)
      state: string (colony state when created)
      description: string
      createdAt: timestamp
      isOpened: boolean
      openedBy: userId (if opened)
      openedAt: timestamp (if opened)
```

### Integration Points

#### 1. HTML (`app.html`)
- Colony display container in group header
- Weekly chest banner container
- Modal for chest opening

#### 2. JavaScript (`app-platform.js`)
- Called in `loadSimpleModeDetailView()`:
  ```javascript
  await ColonySystem.updateColonyDisplay(groupId);
  await ColonySystem.checkWeeklyChest(groupId);
  ```

#### 3. CSS (`colony-styles.css`)
- `.colony-mini-display`: Header colony visual
- `.weekly-chest-banner`: Non-invasive notification
- `.weekly-chest-modal`: Chest opening experience

## Feature Flag

Control rollout with global flag:

```javascript
window.COLONY_FEATURE_ENABLED = true; // or false to disable
```

Set in `app-platform.js` or a config file.

## Future Enhancements

### Planned

1. **Cloud Function**: Automated weekly evaluation
   - Runs every Monday at midnight
   - Evaluates all active groups
   - Creates weekly chests for qualifying groups

2. **Notifications**: Push notifications when chest is available

3. **Social Sharing**: Share colony achievements

4. **Milestones**: Special badges for long-term colonies

### Ideas

- Colony "seasons" with special themes
- Member contribution streaks
- Inter-colony comparisons (leaderboard)
- Special events (holidays, anniversaries)

## Performance Considerations

- **Lazy Loading**: Colony system only loads when group is viewed
- **Cached Reads**: Colony state cached to minimize Firebase reads
- **Fail Silently**: If colony system fails, app continues normally
- **Minimal DOM**: SVG rendering is lightweight

## Privacy & Security

- **Member-Only Access**: Only group members can see colony
- **No PII**: Colony data contains no personal information
- **Read-Only for Most**: Only members can update (via activity)
- **Validated Writes**: Firebase rules enforce data integrity

## Testing Checklist

- [ ] Colony visual renders correctly in all 4 states
- [ ] Weekly chest appears when criteria met
- [ ] Chest can only be opened once
- [ ] Multiple users can see same chest
- [ ] Feature flag disables system cleanly
- [ ] No errors when Firebase is slow/offline
- [ ] Mobile responsive design works
- [ ] Light/dark theme support

## Analytics Events (Future)

Track engagement with:
- `colony_chest_opened`: When user opens weekly chest
- `colony_state_upgraded`: When colony advances state
- `colony_viewed`: When user views colony modal

## Credits

Designed and implemented as a retention mechanism inspired by:
- Duolingo's streak system
- Habitica's avatar growth
- Discord's server boosts

Built with ❤️ for Ant Pool 🐜
