# Realtime Auto-Refresh Guide
## Google Drive / Notion-Style Live Collaboration

Campus GTM now features **realtime auto-refresh** across all workspace pages, similar to Google Drive or Notion. When one user makes changes, all other users viewing the same workspace see those changes instantly without refreshing the page.

---

## Features

### ✅ What Auto-Refreshes in Real-Time

| Location | What Refreshes | Trigger |
|----------|---------------|---------|
| **Workspace Page** (`/workspace/[id]`) | All modules, content, metadata | Any module update, block addition |
| **Module Editor** (`/workspace/[id]/module/[moduleId]`) | Module content, blocks | Another user saves changes |
| **Notifications Bell** | New notifications appear | System creates notification |
| **Ambassador Dashboard** | Tracking links, analytics | New clicks, signups |

### 🔔 Smart Notifications

When changes occur, you'll see:
- **Toast notifications** - Subtle popups in bottom-right
- **Live badge** - Green "Live" indicator when connected
- **Auto-refresh** - Content updates automatically

---

## How It Works

### Architecture

```
User A edits module
      ↓
Save triggers workspace event
      ↓
Supabase Realtime broadcasts to channel
      ↓
User B's browser receives event
      ↓
Page auto-refreshes content
      ↓
User B sees changes instantly
```

### Under the Hood

1. **Supabase Triggers**: Database triggers call `realtime.broadcast_changes()`
2. **WebSocket Connection**: Browser maintains persistent connection
3. **Event Listeners**: React hooks listen for events
4. **Smart Refresh**: Only affected components reload

---

## User Experience

### Connection Indicator

Every workspace page shows a **"Live"** badge when realtime is active:

```
┌─────────────────────────────┐
│ My Workspace     [🟢 Live]  │
└─────────────────────────────┘
```

- **Green** = Connected to realtime
- **Hidden** = Disconnected (still works, just no auto-refresh)

### Update Notifications

When someone else makes changes:

```
╭──────────────────────────────╮
│ ℹ️ Module updated             │
│ Refreshing workspace...      │
╰──────────────────────────────╯
```

You'll see this for:
- Module updates
- Block additions
- Content changes
- User joins

---

## For Developers

### Workspace Page Auto-Refresh

Location: `/app/workspace/[id]/page.tsx`

**Added features:**
- Subscribes to workspace events via `useRealtimeWorkspaceEvents()`
- Listens for changes via `useWorkspaceEventListener()`
- Auto-reloads workspace data when events occur
- Shows toast notification on update

**Key code:**
```typescript
// Subscribe to realtime
const { isConnected } = useRealtimeWorkspaceEvents(workspaceId);

// Listen for events and reload
useWorkspaceEventListener(workspaceId, (event) => {
  toast.info('Module updated', {
    description: 'Refreshing workspace...',
  });
  loadWorkspace(); // Reload data
});
```

### Module Editor Auto-Refresh

Location: `/app/workspace/[id]/module/[moduleId]/page.tsx`

**Added features:**
- Subscribes to workspace events
- Only reloads if someone **else** updated the module (prevents self-refresh loops)
- Shows warning before overwriting unsaved changes
- Triggers event when user saves

**Key code:**
```typescript
// Listen for updates from OTHER users
useWorkspaceEventListener(workspaceId, (event) => {
  if (event.event_type === 'module_updated' &&
      event.metadata?.moduleId === moduleId &&
      event.user_id !== user?.id) { // Check not self
    toast.info('Module updated by another user');
    loadModule(); // Reload
  }
});

// Trigger event on save
await notifyModuleUpdated(workspaceId, userId, moduleId, title);
```

### Server Actions Trigger Events

Location: `/app/actions/modules.ts`

**Updated functions:**
- `updateBlockContent()` - Triggers `MODULE_UPDATED` event
- `addBlock()` - Triggers `BLOCK_ADDED` event
- `updateModuleTitle()` - Triggers `MODULE_UPDATED` event

**New parameters:**
- All functions now accept `workspaceId` and `userId`
- Events only triggered if these are provided

**Example:**
```typescript
export async function updateBlockContent(
  blockId: string,
  content: string,
  workspaceId?: string,  // NEW
  userId?: string        // NEW
) {
  // ... update database ...

  // Trigger realtime event
  if (workspaceId && userId) {
    await createWorkspaceEvent(
      workspaceId,
      userId,
      WorkspaceEventType.MODULE_UPDATED,
      { blockId, action: 'content_updated' }
    );
  }
}
```

---

## Testing

### Test 1: Workspace Auto-Refresh

1. Open workspace page in two browser tabs
2. Edit a module in Tab 1
3. **Expected**: Tab 2 shows toast notification and refreshes

### Test 2: Module Editor Collision

1. Open same module editor in two tabs
2. Edit in Tab 1, click Save
3. **Expected**: Tab 2 shows "Module updated by another user" and reloads

### Test 3: Connection Indicator

1. Open any workspace page
2. Check for green "Live" badge next to workspace name
3. **Expected**: Badge appears within 1-2 seconds

### Test 4: Block Operations

1. Add a new block in Tab 1
2. **Expected**: Tab 2 refreshes workspace view

---

## Console Logging

All realtime activity is logged to console:

```
[Realtime] Workspace events channel status: SUBSCRIBED
[WorkspacePage] Received workspace event: { event_type: 'module_updated', ... }
[ModuleEditorPage] Received workspace event: { ... }
```

Check console if realtime isn't working.

---

## Event Types

Campus GTM uses 4 workspace event types:

| Event Type | Triggered By | Example Use Case |
|------------|-------------|------------------|
| `module_updated` | Module save, title change | Editor auto-refresh |
| `block_added` | New block inserted | Workspace list update |
| `user_joined` | User added to workspace | Team collaboration |
| `strategy_generated` | AI generates strategy | Notification popup |

---

## Performance

### Optimizations

- **Debouncing**: Events are not spammed on every keystroke
- **Smart Refresh**: Only affected components reload
- **Deduplication**: Prevents duplicate events
- **Self-ignore**: Users don't see their own updates twice

### Connection Management

- WebSocket connection established on page load
- Auto-reconnects if connection drops
- Channels cleanup on page unmount
- No memory leaks

---

## Troubleshooting

### "Live" Badge Not Appearing

**Possible causes:**
1. Supabase realtime not enabled in project settings
2. Trigger functions not created in database
3. Network blocking WebSocket connections

**Fix:**
- Run migration: `/supabase/migrations/20241121_add_realtime_workspace_events.sql`
- Check Supabase dashboard → Settings → API → Realtime enabled
- Check browser console for errors

### Pages Not Auto-Refreshing

**Possible causes:**
1. RLS policies blocking SELECT
2. User not authenticated
3. Events not being triggered

**Fix:**
- Check console for `[Realtime]` logs
- Verify trigger functions exist: `SELECT * FROM pg_trigger WHERE tgname LIKE '%broadcast%';`
- Test manually: `INSERT INTO workspace_events (...) VALUES (...);`

### Duplicate Refreshes

**Possible causes:**
1. Multiple subscriptions to same channel
2. Not filtering out self-events

**Fix:**
- Check for duplicate `useWorkspaceEventListener()` calls
- Ensure checking `event.user_id !== user?.id`

---

## Comparison to Other Tools

| Feature | Campus GTM | Notion | Google Docs |
|---------|-----------|--------|-------------|
| Auto-refresh | ✅ Yes | ✅ Yes | ✅ Yes |
| Connection indicator | ✅ Yes | ✅ Yes | ✅ Yes |
| Conflict resolution | ⚠️ Last-write-wins | ✅ OT algorithm | ✅ OT algorithm |
| Presence (cursors) | ❌ No | ✅ Yes | ✅ Yes |
| Toast notifications | ✅ Yes | ⚠️ Limited | ❌ No |

**Future enhancements:**
- Operational Transformation for conflict resolution
- Live cursors showing who's editing where
- Real-time typing indicators

---

## Related Files

| File | Purpose |
|------|---------|
| `/lib/realtime/hooks.ts` | React hooks for subscriptions |
| `/lib/database/workspace-events-service.ts` | Event creation functions |
| `/app/workspace/[id]/page.tsx` | Workspace page with realtime |
| `/app/workspace/[id]/module/[moduleId]/page.tsx` | Module editor with realtime |
| `/app/actions/modules.ts` | Server actions that trigger events |
| `/supabase/migrations/20241121_add_realtime_workspace_events.sql` | Database migration |

---

## Summary

Campus GTM now has **production-ready realtime collaboration**:

✅ Auto-refresh across all workspace pages
✅ Instant notifications for changes
✅ Connection indicator showing live status
✅ Smart refresh only when needed
✅ No self-update loops
✅ Console logging for debugging

**Just like Google Drive or Notion, but for GTM strategy! 🚀**
