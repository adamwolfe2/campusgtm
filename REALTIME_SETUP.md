# Realtime Setup Guide

This guide explains how to use the realtime features in Campus GTM.

## Features Implemented

### 1. Per-User Notifications (user::{userId}::notifications)
Real-time notifications for individual users when:
- AI generates a strategy
- A workspace is created/updated
- Team members are invited
- System announcements

### 2. Workspace Events (workspace::{workspaceId}::events)
Real-time collaboration events for workspace members:
- Module updates
- Block additions
- User join events
- Strategy generation completions

## Setup in Supabase

The realtime triggers and RLS policies have been created. If you need to run the migration manually:

1. Go to Supabase SQL Editor
2. Run the migration: `/supabase/migrations/20241121_add_realtime_workspace_events.sql`

## Usage in React Components

### Subscribe to User Notifications

```tsx
import { useRealtimeNotifications, useNotificationListener } from '@/lib/realtime/hooks';

function MyComponent() {
  const { user } = useUser();

  // Subscribe to realtime channel
  const { isConnected } = useRealtimeNotifications(user?.id);

  // Listen for new notifications
  useNotificationListener((notification) => {
    console.log('New notification:', notification);
    // Handle the notification
  });

  return (
    <div>
      Realtime: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

### Subscribe to Workspace Events

```tsx
import { useRealtimeWorkspaceEvents, useWorkspaceEventListener } from '@/lib/realtime/hooks';

function WorkspacePage({ workspaceId }: { workspaceId: string }) {
  const { isConnected, events } = useRealtimeWorkspaceEvents(workspaceId);

  // Or use the listener approach
  useWorkspaceEventListener(workspaceId, (event) => {
    console.log('Workspace event:', event);
    // Refresh data, show toast, etc.
  });

  return (
    <div>
      <p>Realtime: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Recent events: {events.length}</p>
    </div>
  );
}
```

## Creating Workspace Events

Use the workspace events service to trigger realtime broadcasts:

```tsx
import {
  notifyModuleUpdated,
  notifyBlockAdded,
  notifyUserJoined,
  notifyStrategyGenerated,
} from '@/lib/database/workspace-events-service';

// When a module is updated
await notifyModuleUpdated(
  workspaceId,
  userId,
  moduleId,
  'Content Calendar Updated'
);

// When a block is added
await notifyBlockAdded(
  workspaceId,
  userId,
  moduleId,
  'checklist'
);

// When a user joins the workspace
await notifyUserJoined(
  workspaceId,
  userId,
  'John Doe'
);

// When a strategy is generated
await notifyStrategyGenerated(
  workspaceId,
  userId,
  'Ambassador Program'
);
```

## How It Works

### Architecture

1. **Trigger Functions**: When a row is inserted into `notifications` or `workspace_events`, a SECURITY DEFINER trigger function calls `realtime.broadcast_changes()`

2. **Channel Naming**:
   - User notifications: `user::{userId}::notifications`
   - Workspace events: `workspace::{workspaceId}::events`

3. **React Hooks**: Subscribe to Supabase realtime channels and dispatch custom events that React components can listen to

4. **RLS Policies**: Ensure users can only view/create events for workspaces they own

### Data Flow

```
┌─────────────────┐
│  Insert Event   │
│  to Database    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Trigger Function│
│   (SECURITY     │
│    DEFINER)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│realtime.broadcast│
│   _changes()    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase       │
│  Realtime       │
│  Channel        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Hook     │
│  Subscription   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Custom Event    │
│ Dispatch        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Component     │
│   Updates UI    │
└─────────────────┘
```

## Components Already Using Realtime

### NotificationsDropdown
- **File**: `/components/notifications-dropdown.tsx`
- **Channel**: `user::{userId}::notifications`
- **Behavior**:
  - Shows real-time notification badge count
  - Displays toast when new notification arrives
  - Auto-refreshes notification list

## Adding Realtime to More Components

### Example: Auto-refresh Module List

```tsx
'use client';

import { useEffect } from 'react';
import { useWorkspaceEventListener } from '@/lib/realtime/hooks';

export function ModulesList({ workspaceId }: { workspaceId: string }) {
  const [modules, setModules] = useState([]);

  // Listen for workspace events
  useWorkspaceEventListener(workspaceId, (event) => {
    if (event.event_type === 'module_updated') {
      // Refresh the modules list
      fetchModules();
    }
  });

  const fetchModules = async () => {
    // Your existing fetch logic
  };

  return (
    // Your component JSX
  );
}
```

## Testing Realtime

### Manual Test

1. Open two browser windows side-by-side
2. Log in as the same user in both windows
3. In one window, trigger a notification (e.g., create a workspace)
4. The notification should appear instantly in both windows

### Test Workspace Events

1. Open workspace in two tabs
2. Edit a module in one tab
3. Call `notifyModuleUpdated()` in the edit handler
4. Other tab should receive the event

### Console Logging

All realtime hooks log to console:
- `[Realtime] Notifications channel status: SUBSCRIBED`
- `[Realtime] New notification: {...}`
- `[NotificationsDropdown] New notification received: {...}`

## Performance Notes

- Realtime connections are lightweight
- Channels auto-cleanup on component unmount
- Events are deduplicated to prevent duplicates
- Only last 50 workspace events kept in memory

## Troubleshooting

### Notifications Not Appearing
1. Check browser console for connection errors
2. Verify Supabase realtime is enabled in project settings
3. Confirm trigger functions exist: `SELECT * FROM pg_trigger WHERE tgname LIKE '%broadcast%';`

### Events Not Broadcasting
1. Check RLS policies allow SELECT on tables
2. Verify user is authenticated
3. Test trigger manually: `INSERT INTO notifications (...) VALUES (...);`

### Channel Not Connecting
1. Check Supabase URL and anon key are correct
2. Verify network isn't blocking WebSocket connections
3. Check browser console for realtime errors

## Future Enhancements

- [ ] Presence indicators (see who's viewing a workspace)
- [ ] Typing indicators for collaborative editing
- [ ] Cursor positions for real-time collaboration
- [ ] Message read receipts
- [ ] Online/offline status
