/**
 * Resend Email Client
 * Handles all email delivery for Campus GTM Intelligence System
 */

import { Resend } from "resend";
import type { WeeklyDigest } from "@/app/actions/weekly-digest";
import type { DailyAction } from "@/app/actions/daily-actions";
import {
  weeklyDigestTemplate,
  dailyActionsTemplate,
  intelligenceAlertTemplate,
} from "./templates";

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Sender email - must be verified in Resend
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Campus GTM <noreply@campusgtm.com>";

/**
 * Test mode flag - if no API key, log to console instead
 */
const isTestMode = !resend;

/**
 * Send weekly digest email
 */
export async function sendWeeklyDigest(
  recipientEmail: string,
  digest: WeeklyDigest
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const htmlContent = weeklyDigestTemplate(digest);
    const subject = `Weekly Growth Digest - ${digest.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    // Test mode - log to console
    if (isTestMode) {
      console.log('\n=== EMAIL TEST MODE ===');
      console.log(`To: ${recipientEmail}`);
      console.log(`From: ${FROM_EMAIL}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content length: ${htmlContent.length} chars`);
      console.log('Note: Set RESEND_API_KEY in .env to send real emails');
      console.log('======================\n');

      return {
        success: true,
        messageId: `test-${Date.now()}`,
      };
    }

    // Production mode - send via Resend
    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send daily actions summary email
 */
export async function sendDailyActionsSummary(
  recipientEmail: string,
  actions: DailyAction[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const htmlContent = dailyActionsTemplate(actions);
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const subject = `Your Daily GTM Actions - ${today}`;

    // Test mode - log to console
    if (isTestMode) {
      console.log('\n=== EMAIL TEST MODE ===');
      console.log(`To: ${recipientEmail}`);
      console.log(`From: ${FROM_EMAIL}`);
      console.log(`Subject: ${subject}`);
      console.log(`Actions: ${actions.length}`);
      console.log('Note: Set RESEND_API_KEY in .env to send real emails');
      console.log('======================\n');

      return {
        success: true,
        messageId: `test-${Date.now()}`,
      };
    }

    // Production mode - send via Resend
    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send intelligence alert for high-priority items
 */
export async function sendIntelligenceAlert(
  recipientEmail: string,
  alert: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    url: string;
    type: 'keyword_mention' | 'competitor_change' | 'viral_content' | 'community';
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const htmlContent = intelligenceAlertTemplate(alert);
    const subject = `🚨 Intelligence Alert: ${alert.title}`;

    // Test mode - log to console
    if (isTestMode) {
      console.log('\n=== EMAIL TEST MODE ===');
      console.log(`To: ${recipientEmail}`);
      console.log(`From: ${FROM_EMAIL}`);
      console.log(`Subject: ${subject}`);
      console.log(`Priority: ${alert.priority}`);
      console.log('Note: Set RESEND_API_KEY in .env to send real emails');
      console.log('======================\n');

      return {
        success: true,
        messageId: `test-${Date.now()}`,
      };
    }

    // Production mode - send via Resend
    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch send emails (for future use - sending to multiple recipients)
 */
export async function batchSendEmails(
  recipients: string[],
  emailGenerator: (email: string) => Promise<{ subject: string; html: string }>
): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
  const results = {
    successCount: 0,
    failureCount: 0,
    errors: [] as string[],
  };

  for (const email of recipients) {
    try {
      const { subject, html } = await emailGenerator(email);

      if (isTestMode) {
        console.log(`[TEST] Would send to: ${email} - Subject: ${subject}`);
        results.successCount++;
        continue;
      }

      const { error } = await resend!.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html,
      });

      if (error) {
        results.failureCount++;
        results.errors.push(`${email}: ${error.message}`);
      } else {
        results.successCount++;
      }
    } catch (error) {
      results.failureCount++;
      results.errors.push(
        `${email}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return results;
}
