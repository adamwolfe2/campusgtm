/**
 * CSV Export Utilities for Campus GTM Intelligence System
 * RFC 4180 compliant CSV generation
 */

/**
 * Escape CSV field - handles commas, quotes, and newlines
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }

  const stringValue = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(headers: string[], rows: any[][]): string {
  const csvRows = [
    headers.map(escapeCSVField).join(','), // Header row
    ...rows.map(row => row.map(escapeCSVField).join(',')) // Data rows
  ];

  return csvRows.join('\n');
}

/**
 * Format date as ISO string
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Export Keyword Mentions to CSV
 */
export function exportKeywordMentions(mentions: Array<{
  platform: string;
  url: string;
  title: string;
  content: string;
  author: string;
  engagementScore: number;
  relevanceScore: number;
  suggestedReply: string;
  metadata: Record<string, any>;
}>): string {
  const headers = [
    'Platform',
    'Title',
    'URL',
    'Author',
    'Content Preview',
    'Relevance Score',
    'Engagement Score',
    'Upvotes',
    'Comments',
    'Subreddit/Source',
    'Suggested Reply',
  ];

  const rows = mentions.map(m => [
    m.platform,
    m.title,
    m.url,
    m.author,
    m.content.substring(0, 200), // Limit content preview
    m.relevanceScore,
    m.engagementScore,
    m.metadata.score || m.metadata.points || 0,
    m.metadata.num_comments || 0,
    m.metadata.subreddit || 'N/A',
    m.suggestedReply.substring(0, 300), // Limit reply length
  ]);

  return arrayToCSV(headers, rows);
}

/**
 * Export Communities to CSV
 */
export function exportCommunities(communities: Array<{
  platform: string;
  name: string;
  url: string;
  description: string;
  memberCount: number;
  activityScore: number;
  relevanceScore: number;
  engagementStrategy: string;
  rules?: string;
  bestPostingTimes?: string;
}>): string {
  const headers = [
    'Platform',
    'Community Name',
    'URL',
    'Description',
    'Member Count',
    'Activity Score',
    'Relevance Score',
    'Engagement Strategy',
    'Best Posting Times',
    'Rules Summary',
  ];

  const rows = communities.map(c => [
    c.platform,
    c.name,
    c.url,
    c.description.substring(0, 300),
    c.memberCount,
    c.activityScore,
    c.relevanceScore,
    c.engagementStrategy.substring(0, 300),
    c.bestPostingTimes || 'N/A',
    c.rules ? c.rules.substring(0, 200) : 'N/A',
  ]);

  return arrayToCSV(headers, rows);
}

/**
 * Export Competitors to CSV
 */
export function exportCompetitors(competitors: Array<{
  name: string;
  website: string;
  description: string;
  source: string;
  lastSnapshot?: Date;
  snapshot?: {
    url: string;
    contentHash: string;
    metadata: {
      pricing?: string[];
      features?: string[];
      teamSize?: string;
      latestUpdates?: string[];
      lastModified?: string;
    };
  };
}>): string {
  const headers = [
    'Competitor Name',
    'Website',
    'Description',
    'Source',
    'Last Snapshot Date',
    'Pricing (First 3)',
    'Team Size',
    'Latest Updates',
  ];

  const rows = competitors.map(c => [
    c.name,
    c.website,
    c.description,
    c.source,
    c.lastSnapshot ? formatDate(c.lastSnapshot) : 'Never',
    c.snapshot?.metadata.pricing?.slice(0, 3).join(' | ') || 'N/A',
    c.snapshot?.metadata.teamSize || 'N/A',
    c.snapshot?.metadata.latestUpdates?.slice(0, 2).join(' | ') || 'N/A',
  ]);

  return arrayToCSV(headers, rows);
}

/**
 * Export Viral Content to CSV
 */
export function exportViralContent(content: Array<{
  platform: string;
  url: string;
  title: string;
  content: string;
  author: string;
  engagementScore: number;
  whyViral: string;
  contentIdeas: string[];
  metadata: Record<string, any>;
  detectedAt: Date;
}>): string {
  const headers = [
    'Platform',
    'Title',
    'URL',
    'Author',
    'Engagement Score',
    'Upvotes/Points',
    'Comments',
    'Why It Went Viral',
    'Content Ideas (First 3)',
    'Content Preview',
    'Detected Date',
  ];

  const rows = content.map(v => [
    v.platform,
    v.title,
    v.url,
    v.author,
    v.engagementScore,
    v.metadata.score || v.metadata.points || 0,
    v.metadata.num_comments || 0,
    v.whyViral,
    v.contentIdeas.slice(0, 3).join(' | '),
    v.content.substring(0, 200),
    formatDate(v.detectedAt),
  ]);

  return arrayToCSV(headers, rows);
}

/**
 * Export Daily Actions to CSV
 */
export function exportDailyActions(actions: Array<{
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  priority: string;
  estimatedTime: string;
  sourceType?: string;
  sourceId?: string;
  completed?: boolean;
}>): string {
  const headers = [
    'Priority',
    'Type',
    'Title',
    'Description',
    'Estimated Time',
    'URL',
    'Source Type',
    'Completed',
  ];

  const rows = actions.map(a => [
    a.priority.toUpperCase(),
    a.type.replace(/_/g, ' ').toUpperCase(),
    a.title,
    a.description,
    a.estimatedTime,
    a.url,
    a.sourceType?.replace(/_/g, ' ') || 'N/A',
    a.completed ? 'Yes' : 'No',
  ]);

  return arrayToCSV(headers, rows);
}

/**
 * Export Content Leaderboard to CSV
 */
export function exportContentLeaderboard(items: Array<{
  rank: number;
  title: string;
  platform: string;
  url: string;
  engagement: number;
  engagementScore: number;
  viralityPotential: number;
  whatWorked: string;
  metadata: Record<string, any>;
}>): string {
  const headers = [
    'Rank',
    'Title',
    'Platform',
    'URL',
    'Engagement Count',
    'Engagement Score',
    'Virality Potential',
    'What Worked',
    'Author',
    'Subreddit/Source',
    'Upvotes/Points',
    'Comments',
  ];

  const rows = items.map(item => [
    item.rank,
    item.title,
    item.platform,
    item.url,
    item.engagement,
    item.engagementScore,
    item.viralityPotential,
    item.whatWorked,
    item.metadata.author || 'N/A',
    item.metadata.subreddit || 'N/A',
    item.metadata.score || item.metadata.points || 0,
    item.metadata.comments || item.metadata.num_comments || 0,
  ]);

  return arrayToCSV(headers, rows);
}

/**
 * Export Weekly Digest Summary to CSV
 */
export function exportWeeklyDigest(digest: {
  weekStart: Date;
  weekEnd: Date;
  metrics: {
    communitiesFound: number;
    keywordsMonitored: number;
    viralContentDiscovered: number;
    competitorChanges: number;
    actionsCompleted: number;
    totalMentions: number;
  };
  topOpportunities: Array<{
    title: string;
    description: string;
    type: string;
  }>;
  competitiveInsights: string[];
  contentTrends: string[];
  nextWeekFocus: string[];
}): string {
  // Create a multi-section CSV with metadata
  const sections: string[] = [];

  // Metadata section
  sections.push('=== WEEKLY DIGEST SUMMARY ===');
  sections.push(`Week Start,${digest.weekStart.toISOString()}`);
  sections.push(`Week End,${digest.weekEnd.toISOString()}`);
  sections.push('');

  // Metrics section
  sections.push('=== METRICS ===');
  sections.push('Metric,Value');
  sections.push(`Communities Found,${digest.metrics.communitiesFound}`);
  sections.push(`Keywords Monitored,${digest.metrics.keywordsMonitored}`);
  sections.push(`Total Mentions,${digest.metrics.totalMentions}`);
  sections.push(`Viral Content,${digest.metrics.viralContentDiscovered}`);
  sections.push(`Competitor Changes,${digest.metrics.competitorChanges}`);
  sections.push(`Actions Completed,${digest.metrics.actionsCompleted}`);
  sections.push('');

  // Opportunities section
  if (digest.topOpportunities.length > 0) {
    sections.push('=== TOP OPPORTUNITIES ===');
    sections.push('Type,Title,Description');
    digest.topOpportunities.forEach(opp => {
      sections.push([
        escapeCSVField(opp.type),
        escapeCSVField(opp.title),
        escapeCSVField(opp.description)
      ].join(','));
    });
    sections.push('');
  }

  // Competitive Insights section
  if (digest.competitiveInsights.length > 0) {
    sections.push('=== COMPETITIVE INSIGHTS ===');
    sections.push('Insight');
    digest.competitiveInsights.forEach(insight => {
      sections.push(escapeCSVField(insight));
    });
    sections.push('');
  }

  // Content Trends section
  if (digest.contentTrends.length > 0) {
    sections.push('=== CONTENT TRENDS ===');
    sections.push('Trend');
    digest.contentTrends.forEach(trend => {
      sections.push(escapeCSVField(trend));
    });
    sections.push('');
  }

  // Next Week Focus section
  if (digest.nextWeekFocus.length > 0) {
    sections.push('=== NEXT WEEK FOCUS ===');
    sections.push('Priority,Action');
    digest.nextWeekFocus.forEach((focus, index) => {
      sections.push(`${index + 1},${escapeCSVField(focus)}`);
    });
  }

  return sections.join('\n');
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(baseName: string, extension: string = 'csv'): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${baseName}-${timestamp}.${extension}`;
}
