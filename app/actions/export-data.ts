"use server";

/**
 * Server Actions for Data Export
 * Handles CSV export for various intelligence data types
 */

import {
  exportKeywordMentions,
  exportCommunities,
  exportCompetitors,
  exportViralContent,
  exportDailyActions,
  exportContentLeaderboard,
  exportWeeklyDigest,
} from "@/lib/export/csv-exporter";

/**
 * Export keyword mentions to CSV
 */
export async function exportKeywordMentionsCSV(mentions: Array<{
  platform: string;
  url: string;
  title: string;
  content: string;
  author: string;
  engagementScore: number;
  relevanceScore: number;
  suggestedReply: string;
  metadata: Record<string, any>;
}>): Promise<string> {
  return exportKeywordMentions(mentions);
}

/**
 * Export communities to CSV
 */
export async function exportCommunitiesCSV(communities: Array<{
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
}>): Promise<string> {
  return exportCommunities(communities);
}

/**
 * Export competitors to CSV
 */
export async function exportCompetitorsCSV(competitors: Array<{
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
}>): Promise<string> {
  return exportCompetitors(competitors);
}

/**
 * Export viral content to CSV
 */
export async function exportViralContentCSV(content: Array<{
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
}>): Promise<string> {
  return exportViralContent(content);
}

/**
 * Export daily actions to CSV
 */
export async function exportDailyActionsCSV(actions: Array<{
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
}>): Promise<string> {
  return exportDailyActions(actions);
}

/**
 * Export content leaderboard to CSV
 */
export async function exportContentLeaderboardCSV(items: Array<{
  rank: number;
  title: string;
  platform: string;
  url: string;
  engagement: number;
  engagementScore: number;
  viralityPotential: number;
  whatWorked: string;
  metadata: Record<string, any>;
}>): Promise<string> {
  return exportContentLeaderboard(items);
}

/**
 * Export weekly digest to CSV
 */
export async function exportWeeklyDigestCSV(digest: {
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
}): Promise<string> {
  return exportWeeklyDigest(digest);
}
