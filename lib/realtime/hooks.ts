/**
 * Realtime Hooks for Supabase
 * Provides React hooks for subscribing to realtime channels
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/database/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook to subscribe to user notifications in realtime
 * Channel: user::{userId}::notifications
 */
export function useRealtimeNotifications(userId: string | undefined) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId || !supabase) return;

    const channelName = `user::${userId}::notifications`;

    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'INSERT' },
        (payload) => {
          console.log('[Realtime] New notification:', payload);
          // Trigger a custom event that components can listen to
          window.dispatchEvent(
            new CustomEvent('new-notification', { detail: payload })
          );
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Notifications channel status: ${status}`);
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(realtimeChannel);

    return () => {
      console.log('[Realtime] Unsubscribing from notifications');
      realtimeChannel.unsubscribe();
    };
  }, [userId]);

  return { isConnected, channel };
}

/**
 * Hook to subscribe to workspace events in realtime
 * Channel: workspace::{workspaceId}::events
 */
export function useRealtimeWorkspaceEvents(workspaceId: string | undefined) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!workspaceId || !supabase) return;

    const channelName = `workspace::${workspaceId}::events`;

    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'INSERT' },
        (payload) => {
          console.log('[Realtime] New workspace event:', payload);

          // Add to events list
          setEvents((prev) => [payload, ...prev].slice(0, 50)); // Keep last 50 events

          // Trigger custom event
          window.dispatchEvent(
            new CustomEvent('workspace-event', {
              detail: { workspaceId, payload }
            })
          );
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Workspace events channel status: ${status}`);
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(realtimeChannel);

    return () => {
      console.log('[Realtime] Unsubscribing from workspace events');
      realtimeChannel.unsubscribe();
    };
  }, [workspaceId]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return { isConnected, channel, events, clearEvents };
}

/**
 * Hook to listen for custom notification events
 * Use this in components that need to react to new notifications
 */
export function useNotificationListener(callback: (notification: any) => void) {
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      callback(customEvent.detail);
    };

    window.addEventListener('new-notification', handler);

    return () => {
      window.removeEventListener('new-notification', handler);
    };
  }, [callback]);
}

/**
 * Hook to listen for workspace events
 * Use this in components that need to react to workspace changes
 */
export function useWorkspaceEventListener(
  workspaceId: string,
  callback: (event: any) => void
) {
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.workspaceId === workspaceId) {
        callback(customEvent.detail.payload);
      }
    };

    window.addEventListener('workspace-event', handler);

    return () => {
      window.removeEventListener('workspace-event', handler);
    };
  }, [workspaceId, callback]);
}
