"use server";

/**
 * Server Actions for Email Delivery
 * Handles sending emails via Resend
 */

import {
  sendWeeklyDigest,
  sendDailyActionsSummary,
  sendIntelligenceAlert,
} from "@/lib/email/resend-client";
import type { WeeklyDigest } from "./weekly-digest";
import type { DailyAction } from "./daily-actions";

/**
 * Send weekly digest email
 */
export async function sendWeeklyDigestEmail(
  recipientEmail: string,
  digest: WeeklyDigest
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return {
        success: false,
        message: 'Invalid email address format',
      };
    }

    const result = await sendWeeklyDigest(recipientEmail, digest);

    if (result.success) {
      return {
        success: true,
        message: `Weekly digest sent successfully to ${recipientEmail}`,
      };
    } else {
      return {
        success: false,
        message: result.error || 'Failed to send email',
      };
    }
  } catch (error) {
    console.error('Send weekly digest error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send daily actions summary email
 */
export async function sendDailyActionsEmail(
  recipientEmail: string,
  actions: DailyAction[]
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return {
        success: false,
        message: 'Invalid email address format',
      };
    }

    // Validate actions
    if (!actions || actions.length === 0) {
      return {
        success: false,
        message: 'No actions to send',
      };
    }

    const result = await sendDailyActionsSummary(recipientEmail, actions);

    if (result.success) {
      return {
        success: true,
        message: `Daily actions sent successfully to ${recipientEmail}`,
      };
    } else {
      return {
        success: false,
        message: result.error || 'Failed to send email',
      };
    }
  } catch (error) {
    console.error('Send daily actions error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send intelligence alert email
 */
export async function sendAlertEmail(
  recipientEmail: string,
  alert: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    url: string;
    type: 'keyword_mention' | 'competitor_change' | 'viral_content' | 'community';
  }
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return {
        success: false,
        message: 'Invalid email address format',
      };
    }

    const result = await sendIntelligenceAlert(recipientEmail, alert);

    if (result.success) {
      return {
        success: true,
        message: `Alert sent successfully to ${recipientEmail}`,
      };
    } else {
      return {
        success: false,
        message: result.error || 'Failed to send email',
      };
    }
  } catch (error) {
    console.error('Send alert error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
