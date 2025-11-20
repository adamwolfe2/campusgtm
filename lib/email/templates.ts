/**
 * Email Templates for Campus GTM Intelligence System
 * All templates use inline CSS for maximum email client compatibility
 */

import type { WeeklyDigest } from "@/app/actions/weekly-digest";
import type { DailyAction } from "@/app/actions/daily-actions";

/**
 * Base styles used across all templates
 */
const baseStyles = {
  body: 'margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
  container: 'max-width: 600px; margin: 0 auto; background-color: #ffffff;',
  header: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;',
  content: 'padding: 40px 30px;',
  footer: 'padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;',
};

/**
 * Weekly Digest Email Template
 */
export function weeklyDigestTemplate(digest: WeeklyDigest): string {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Convert markdown summary to HTML
  const htmlSummary = digest.summary
    .replace(/^# (.+)$/gm, '<h2 style="font-size: 20px; font-weight: 600; margin: 24px 0 12px; color: #111827;">$1</h2>')
    .replace(/^## (.+)$/gm, '<h3 style="font-size: 16px; font-weight: 600; margin: 16px 0 8px; color: #374151;">$1</h3>')
    .replace(/^\- (.+)$/gm, '<li style="margin: 6px 0; color: #4b5563;">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .split('\n\n')
    .map(p => {
      if (p.startsWith('<') || !p.trim()) return p;
      return `<p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 12px 0;">${p}</p>`;
    })
    .join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Growth Digest - Campus GTM</title>
</head>
<body style="${baseStyles.body}">
  <div style="${baseStyles.container}">
    <!-- Header -->
    <div style="${baseStyles.header}">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
        Campus GTM
      </h1>
      <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 500;">
        Weekly Growth Digest
      </p>
      <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
        ${formatDate(digest.weekStart)} - ${formatDate(digest.weekEnd)}
      </p>
    </div>

    <!-- Metrics Grid -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0 30px 40px;">
      <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
        <h3 style="margin: 0 0 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">
          Week at a Glance
        </h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="50%" style="padding: 12px; vertical-align: top;">
              <div style="font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 4px;">
                ${digest.metrics.communitiesFound}
              </div>
              <div style="font-size: 13px; color: #6b7280;">Communities Found</div>
            </td>
            <td width="50%" style="padding: 12px; vertical-align: top;">
              <div style="font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 4px;">
                ${digest.metrics.totalMentions}
              </div>
              <div style="font-size: 13px; color: #6b7280;">Keyword Mentions</div>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding: 12px; vertical-align: top;">
              <div style="font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 4px;">
                ${digest.metrics.viralContentDiscovered}
              </div>
              <div style="font-size: 13px; color: #6b7280;">Viral Content</div>
            </td>
            <td width="50%" style="padding: 12px; vertical-align: top;">
              <div style="font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 4px;">
                ${digest.metrics.actionsCompleted}
              </div>
              <div style="font-size: 13px; color: #6b7280;">Actions Completed</div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- AI Summary -->
    <div style="${baseStyles.content}">
      <div style="margin-bottom: 32px;">
        ${htmlSummary}
      </div>

      ${digest.topOpportunities.length > 0 ? `
      <!-- Top Opportunities -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #78350f;">
          💡 Top Opportunities
        </h3>
        ${digest.topOpportunities.map(opp => `
        <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #78350f; margin-bottom: 6px;">
            ${opp.type}
          </div>
          <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 6px;">
            ${opp.title}
          </div>
          <div style="font-size: 13px; color: #4b5563; line-height: 1.5;">
            ${opp.description}
          </div>
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${digest.nextWeekFocus.length > 0 ? `
      <!-- Next Week Focus -->
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%); border-radius: 12px; padding: 24px;">
        <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1e3a8a;">
          🎯 Next Week's Focus
        </h3>
        ${digest.nextWeekFocus.map((focus, index) => `
        <div style="display: flex; margin-bottom: 12px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #3b82f6; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 12px; flex-shrink: 0;">
            ${index + 1}
          </div>
          <div style="font-size: 14px; color: #1e3a8a; line-height: 1.6; padding-top: 6px;">
            ${focus}
          </div>
        </div>
        `).join('')}
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="${baseStyles.footer}">
      <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
        Generated by <strong>Campus GTM Intelligence System</strong>
      </p>
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a> ·
        <a href="#" style="color: #667eea; text-decoration: none;">Email Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Daily Actions Email Template
 */
export function dailyActionsTemplate(actions: DailyAction[]): string {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const priorityColors = {
    high: { bg: '#fee2e2', text: '#991b1b', badge: '#dc2626' },
    medium: { bg: '#fef3c7', text: '#78350f', badge: '#f59e0b' },
    low: { bg: '#dcfce7', text: '#166534', badge: '#22c55e' },
  };

  const actionTypeEmojis = {
    engage_thread: '💬',
    join_community: '👥',
    monitor_competitor: '👀',
    publish_content: '📝',
    analyze_viral: '📈',
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily GTM Actions - Campus GTM</title>
</head>
<body style="${baseStyles.body}">
  <div style="${baseStyles.container}">
    <!-- Header -->
    <div style="${baseStyles.header}">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
        Your Daily GTM Actions
      </h1>
      <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
        ${today}
      </p>
    </div>

    <!-- Content -->
    <div style="${baseStyles.content}">
      <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 24px;">
        Here are your top ${actions.length} priority actions for today:
      </p>

      ${actions.map((action, index) => {
        const colors = priorityColors[action.priority];
        const emoji = actionTypeEmojis[action.type];

        return `
        <div style="background-color: ${colors.bg}; border-left: 4px solid ${colors.badge}; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <div style="display: flex; align-items: start; margin-bottom: 12px;">
            <div style="font-size: 24px; margin-right: 12px;">${emoji}</div>
            <div style="flex: 1;">
              <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: ${colors.text}; margin-bottom: 6px;">
                ${action.priority} Priority · ${action.estimatedTime}
              </div>
              <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111827;">
                ${action.title}
              </h3>
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #4b5563;">
                ${action.description}
              </p>
            </div>
          </div>

          <div style="text-align: right;">
            <a href="${action.url}"
               style="display: inline-block; background-color: ${colors.badge}; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600;">
              Take Action →
            </a>
          </div>
        </div>
        `;
      }).join('')}

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 24px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          Complete these actions in your dashboard to track your progress
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="${baseStyles.footer}">
      <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
        Generated by <strong>Campus GTM Intelligence System</strong>
      </p>
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        <a href="#" style="color: #667eea; text-decoration: none;">Manage Notifications</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Intelligence Alert Email Template
 */
export function intelligenceAlertTemplate(alert: {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  url: string;
  type: string;
}): string {
  const priorityConfig = {
    high: {
      color: '#dc2626',
      bg: '#fee2e2',
      text: '#991b1b',
      emoji: '🚨',
      label: 'HIGH PRIORITY',
    },
    medium: {
      color: '#f59e0b',
      bg: '#fef3c7',
      text: '#78350f',
      emoji: '⚠️',
      label: 'MEDIUM PRIORITY',
    },
    low: {
      color: '#22c55e',
      bg: '#dcfce7',
      text: '#166534',
      emoji: '💡',
      label: 'NEW OPPORTUNITY',
    },
  };

  const config = priorityConfig[alert.priority];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Intelligence Alert - Campus GTM</title>
</head>
<body style="${baseStyles.body}">
  <div style="${baseStyles.container}">
    <!-- Header -->
    <div style="background-color: ${config.color}; padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 12px;">${config.emoji}</div>
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
        Intelligence Alert
      </h1>
      <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; letter-spacing: 1px;">
        ${config.label}
      </p>
    </div>

    <!-- Content -->
    <div style="${baseStyles.content}">
      <div style="background-color: ${config.bg}; border-left: 4px solid ${config.color}; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: ${config.text}; margin-bottom: 8px; letter-spacing: 0.5px;">
          ${alert.type.replace(/_/g, ' ')}
        </div>
        <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #111827; line-height: 1.3;">
          ${alert.title}
        </h2>
        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
          ${alert.description}
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${alert.url}"
           style="display: inline-block; background-color: ${config.color}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          View in Dashboard →
        </a>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          This alert was triggered based on your intelligence monitoring settings
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="${baseStyles.footer}">
      <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
        Generated by <strong>Campus GTM Intelligence System</strong>
      </p>
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        <a href="#" style="color: #667eea; text-decoration: none;">Manage Alert Settings</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
