/**
 * Notification Service
 * Works with both Supabase (production) and localStorage (development)
 * Automatically detects which to use based on configuration
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export type NotificationType = "strategy" | "workspace" | "team" | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Creates a new notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<Notification | null> {
  if (isSupabaseConfigured()) {
    // Use Supabase
    const { data, error } = await supabase!
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        read: false,
        metadata: metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create notification:", error.message);
      return null;
    }

    const notification = data as any;
    return {
      id: notification.id,
      userId: notification.user_id,
      type: notification.type as NotificationType,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      metadata: notification.metadata || undefined,
      createdAt: new Date(notification.created_at),
      updatedAt: new Date(notification.updated_at),
    };
  } else {
    // Use localStorage fallback
    const notificationsKey = `notifications_${userId}`;
    const existing = localStorage.getItem(notificationsKey);
    const notifications: Notification[] = existing ? JSON.parse(existing) : [];

    const newNotification: Notification = {
      id: Date.now().toString(),
      userId,
      type,
      title,
      message,
      read: false,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    notifications.unshift(newNotification);
    localStorage.setItem(notificationsKey, JSON.stringify(notifications));

    return newNotification;
  }
}

/**
 * Gets all notifications for a user
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  if (isSupabaseConfigured()) {
    // Use Supabase
    const { data, error } = await supabase!
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch notifications:", error.message);
      return [];
    }

    return (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type as NotificationType,
      title: n.title,
      message: n.message,
      read: n.read,
      metadata: n.metadata || undefined,
      createdAt: new Date(n.created_at),
      updatedAt: new Date(n.updated_at),
    }));
  } else {
    // Use localStorage fallback
    const notificationsKey = `notifications_${userId}`;
    const existing = localStorage.getItem(notificationsKey);
    if (!existing) return [];

    const notifications = JSON.parse(existing);
    return notifications.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      updatedAt: new Date(n.updatedAt),
    }));
  }
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    // Use Supabase
    const { error } = await supabase!
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to mark notification as read:", error.message);
      return false;
    }

    return true;
  } else {
    // Use localStorage fallback
    const notificationsKey = `notifications_${userId}`;
    const existing = localStorage.getItem(notificationsKey);
    if (!existing) return false;

    const notifications = JSON.parse(existing);
    const updated = notifications.map((n: any) =>
      n.id === notificationId ? { ...n, read: true, updatedAt: new Date() } : n
    );

    localStorage.setItem(notificationsKey, JSON.stringify(updated));
    return true;
  }
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    // Use Supabase
    const { error } = await supabase!
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Failed to mark all notifications as read:", error.message);
      return false;
    }

    return true;
  } else {
    // Use localStorage fallback
    const notificationsKey = `notifications_${userId}`;
    const existing = localStorage.getItem(notificationsKey);
    if (!existing) return false;

    const notifications = JSON.parse(existing);
    const updated = notifications.map((n: any) => ({
      ...n,
      read: true,
      updatedAt: new Date(),
    }));

    localStorage.setItem(notificationsKey, JSON.stringify(updated));
    return true;
  }
}

/**
 * Gets the count of unread notifications
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    // Use Supabase
    const { count, error } = await supabase!
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Failed to get unread count:", error.message);
      return 0;
    }

    return count || 0;
  } else {
    // Use localStorage fallback
    const notificationsKey = `notifications_${userId}`;
    const existing = localStorage.getItem(notificationsKey);
    if (!existing) return 0;

    const notifications = JSON.parse(existing);
    return notifications.filter((n: any) => !n.read).length;
  }
}

/**
 * Helper functions to create specific notification types
 */

export async function notifyWorkspaceCreated(
  userId: string,
  workspaceName: string
): Promise<void> {
  await createNotification(
    userId,
    "workspace",
    "Workspace Created",
    `New workspace "${workspaceName}" has been created`,
    { workspaceName }
  );
}

export async function notifyStrategyGenerated(
  userId: string,
  workspaceName: string
): Promise<void> {
  await createNotification(
    userId,
    "strategy",
    "Strategy Generated",
    `Your GTM strategy for ${workspaceName} has been generated successfully`,
    { workspaceName }
  );
}

export async function notifyWelcome(userId: string): Promise<void> {
  await createNotification(
    userId,
    "system",
    "Welcome to Campus GTM",
    "Get started by creating your first GTM strategy workspace"
  );
}
