/**
 * Workspace Events Service
 * Manages workspace events for realtime collaboration
 */

import { supabase } from './supabase';

export const WorkspaceEventType = {
  MODULE_UPDATED: 'module_updated',
  BLOCK_ADDED: 'block_added',
  USER_JOINED: 'user_joined',
  STRATEGY_GENERATED: 'strategy_generated',
} as const;

export type WorkspaceEventType = (typeof WorkspaceEventType)[keyof typeof WorkspaceEventType];

export interface WorkspaceEvent {
  id: string;
  workspace_id: string;
  user_id: string | null;
  event_type: WorkspaceEventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Create a new workspace event
 * This will automatically trigger realtime broadcast to subscribers
 */
export async function createWorkspaceEvent(
  workspaceId: string,
  userId: string,
  eventType: WorkspaceEventType,
  metadata?: Record<string, unknown>
): Promise<WorkspaceEvent | null> {
  if (!supabase) {
    console.error('[WorkspaceEvents] Supabase not configured');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('workspace_events')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        event_type: eventType,
        metadata: metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[WorkspaceEvents] Error creating event:', error);
      return null;
    }

    return data as WorkspaceEvent;
  } catch (error) {
    console.error('[WorkspaceEvents] Unexpected error:', error);
    return null;
  }
}

/**
 * Get recent workspace events
 */
export async function getWorkspaceEvents(
  workspaceId: string,
  limit: number = 50
): Promise<WorkspaceEvent[]> {
  if (!supabase) {
    console.error('[WorkspaceEvents] Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('workspace_events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[WorkspaceEvents] Error fetching events:', error);
      return [];
    }

    return (data as WorkspaceEvent[]) || [];
  } catch (error) {
    console.error('[WorkspaceEvents] Unexpected error:', error);
    return [];
  }
}

/**
 * Helper functions to create specific event types
 */

export async function notifyModuleUpdated(
  workspaceId: string,
  userId: string,
  moduleId: string,
  moduleTitle: string
) {
  return createWorkspaceEvent(
    workspaceId,
    userId,
    WorkspaceEventType.MODULE_UPDATED,
    {
      moduleId,
      moduleTitle,
    }
  );
}

export async function notifyBlockAdded(
  workspaceId: string,
  userId: string,
  moduleId: string,
  blockType: string
) {
  return createWorkspaceEvent(
    workspaceId,
    userId,
    WorkspaceEventType.BLOCK_ADDED,
    {
      moduleId,
      blockType,
    }
  );
}

export async function notifyUserJoined(
  workspaceId: string,
  userId: string,
  userName: string
) {
  return createWorkspaceEvent(
    workspaceId,
    userId,
    WorkspaceEventType.USER_JOINED,
    {
      userName,
    }
  );
}

export async function notifyStrategyGenerated(
  workspaceId: string,
  userId: string,
  strategyType: string
) {
  return createWorkspaceEvent(
    workspaceId,
    userId,
    WorkspaceEventType.STRATEGY_GENERATED,
    {
      strategyType,
    }
  );
}
