# 🔔 Notification System

## Overview
Real-time notification system that keeps group members informed of important activities.

## Features

### Notification Types
- **💸 Expense Added**: When someone adds an expense to the group
- **🗑️ Expense Deleted**: When someone deletes an expense
- **💰 Payment Received**: When someone records a payment to you
- **👥 Member Joined**: When a new member joins the group

### User Interface
- **Bell Icon** in header with badge counter showing unread notifications
- **Notification Panel** that slides down when clicking the bell
- **Auto-refresh** every 30 seconds to check for new notifications
- **Auto-mark as read** after viewing for 2 seconds
- **Time stamps** showing "5 minutes ago", "1 hour ago", etc.
- **Click to navigate** to the related fund/group

### Design
- Full **light/dark mode** support
- Smooth animations and transitions
- Mobile-responsive layout
- Unread notifications highlighted with blue accent

## Database Structure

```
notifications/
  {userId}/
    {notificationId}/
      type: "expense_added" | "expense_deleted" | "payment_received" | "member_joined"
      title: "Short notification title"
      message: "Detailed message with user names and amounts"
      fundId: "group-id-reference"
      expenseId: "expense-id-if-applicable"
      timestamp: 1234567890
      read: false
```

## Integration Points

### 1. Expense Added
**File**: `mode-manager.js` → `addExpense()`
- Notifies all group members except the one who added the expense
- Shows expense details in notification

### 2. Expense Deleted
**File**: `app-platform.js` → `deleteExpense()`
- Notifies all group members
- Shows who deleted what

### 3. Payment Received
**File**: `mode-manager.js` → `recordSettlement()`
- Notifies only the person receiving the payment
- Shows payer name and amount

### 4. Member Joined
**File**: `app-platform.js` → `handleGroupJoin()`
- Notifies all existing members
- Shows new member's name

## Functions

### Core Functions
```javascript
initNotificationSystem()           // Initialize on page load
loadNotifications()                 // Load user's notifications from Firebase
renderNotifications()               // Render notifications in UI
toggleNotificationsPanel()          // Show/hide panel
markNotificationAsRead(id)          // Mark single notification as read
markAllNotificationsAsRead()        // Mark all as read
```

### Helper Functions
```javascript
createNotification(userId, data)    // Create new notification for a user
notifyGroupMembers(fundId, excludeId, data)  // Notify all members except one
getNotificationIcon(type)           // Get emoji for notification type
getTimeAgo(timestamp)               // Convert timestamp to "5 mins ago"
handleNotificationClick(id, ...)    // Handle clicking a notification
```

## CSS Classes

### Main Elements
- `.notifications-btn` - Bell button in header
- `.notification-badge` - Red badge showing unread count
- `.notifications-panel` - Sliding panel container
- `.notifications-list` - Scrollable list of notifications
- `.notification-item` - Individual notification card
- `.notification-item.unread` - Unread notification (highlighted)

### States
- `.hidden` - Hide element
- `.pulse` - Animation for badge

## Usage Example

### Create a Custom Notification
```javascript
const notificationData = {
    type: 'custom_type',
    title: '🎉 Custom Event',
    message: 'Something important happened!',
    fundId: currentFund.fundId
};

// Notify specific user
await createNotification(userId, notificationData);

// Notify all group members except current user
await notifyGroupMembers(groupId, currentUserId, notificationData);
```

## Deployment

✅ **Deployed to Firebase Hosting**: https://blockchaincontract001.web.app
✅ **Committed to GitHub**: commit `7dbbf3b`

## Future Enhancements

Potential improvements:
- Push notifications (browser notifications API)
- Email notifications for important events
- Notification preferences/settings
- Group notifications by type
- Search/filter notifications
- Export notification history
- Notification sound effects
- Desktop notifications when tab is inactive
