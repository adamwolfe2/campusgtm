"use server";

import {
  getNotifications,
  notifyWelcome,
} from "@/lib/database/notification-service";

/**
 * Checks if user has any notifications, if not sends welcome notification
 * This is called when the user first loads the dashboard
 */
export async function ensureWelcomeNotification(userId: string): Promise<void> {
  try {
    const notifications = await getNotifications(userId);

    // If user has no notifications, send welcome
    if (notifications.length === 0) {
      await notifyWelcome(userId);
    }
  } catch (error) {
    console.error("Failed to ensure welcome notification:", error);
    // Don't throw - this is not critical to app functionality
  }
}
