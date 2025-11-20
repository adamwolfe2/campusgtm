"use server";

import { generateText } from "ai";
import { getAIModel } from "@/lib/ai/provider-factory";

/**
 * Priority levels for daily actions
 */
export const ActionPriority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type ActionPriority = (typeof ActionPriority)[keyof typeof ActionPriority];

/**
 * Action types matching different intelligence sources
 */
export const ActionType = {
  ENGAGE_THREAD: 'engage_thread',
  JOIN_COMMUNITY: 'join_community',
  MONITOR_COMPETITOR: 'monitor_competitor',
  PUBLISH_CONTENT: 'publish_content',
  ANALYZE_VIRAL: 'analyze_viral',
} as const;

export type ActionType = (typeof ActionType)[keyof typeof ActionType];

/**
 * Daily action item
 */
export interface DailyAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  url: string;
  priority: ActionPriority;
  estimatedTime: string; // '5min', '15min', '30min'
  sourceType?: string; // 'keyword_mention', 'viral_content', 'competitor_change', 'community'
  sourceId?: string;
  completed?: boolean;
}

/**
 * Intelligence data aggregation for AI ranking
 */
interface IntelligenceData {
  keywordMentions: Array<{
    id: string;
    platform: string;
    url: string;
    title: string;
    content: string;
    relevanceScore: number;
    engagementScore: number;
    suggestedReply: string;
  }>;
  communities: Array<{
    id: string;
    platform: string;
    name: string;
    url: string;
    description: string;
    relevanceScore: number;
    memberCount: number;
    engagementStrategy: string;
  }>;
  competitorChanges: Array<{
    id: string;
    competitorName: string;
    url: string;
    changeType: string;
    summary: string;
    impactScore: number;
  }>;
  viralContent: Array<{
    id: string;
    platform: string;
    url: string;
    title: string;
    engagementScore: number;
    whyViral: string;
    contentIdeas: string[];
  }>;
}

/**
 * Generates daily actions for a workspace
 * Aggregates top 5 daily actions from all intelligence sources
 *
 * @param workspaceId - The workspace to generate actions for
 * @param intelligenceData - Pre-aggregated intelligence data from various sources
 * @returns Array of top 5 prioritized daily actions
 */
export async function generateDailyActions(
  workspaceId: string,
  intelligenceData: IntelligenceData
): Promise<DailyAction[]> {
  try {
    // Build context for AI
    const context = buildIntelligenceContext(intelligenceData);

    // Use AI to rank and select top 5 actions
    const actions = await rankActionsWithAI(context, intelligenceData);

    return actions;
  } catch (error) {
    console.error('Daily actions generation error:', error);
    throw new Error(`Failed to generate daily actions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Builds a context string from intelligence data for AI processing
 */
function buildIntelligenceContext(data: IntelligenceData): string {
  let context = "# Intelligence Data Summary\n\n";

  // High-priority keyword mentions
  const highPriorityMentions = data.keywordMentions.filter(m => m.relevanceScore >= 70);
  if (highPriorityMentions.length > 0) {
    context += `## High-Priority Keyword Mentions (${highPriorityMentions.length})\n`;
    highPriorityMentions.slice(0, 10).forEach(m => {
      context += `- **${m.title}** (${m.platform})\n`;
      context += `  - Relevance: ${m.relevanceScore}/100, Engagement: ${m.engagementScore}\n`;
      context += `  - Suggested Reply: ${m.suggestedReply.substring(0, 100)}...\n`;
      context += `  - URL: ${m.url}\n\n`;
    });
  }

  // New communities discovered
  const topCommunities = data.communities
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);
  if (topCommunities.length > 0) {
    context += `## New Communities Discovered (${topCommunities.length})\n`;
    topCommunities.forEach(c => {
      context += `- **${c.name}** on ${c.platform}\n`;
      context += `  - Members: ${c.memberCount.toLocaleString()}, Relevance: ${c.relevanceScore}/100\n`;
      context += `  - Description: ${c.description.substring(0, 100)}...\n`;
      context += `  - Strategy: ${c.engagementStrategy.substring(0, 100)}...\n`;
      context += `  - URL: ${c.url}\n\n`;
    });
  }

  // Competitor changes
  if (data.competitorChanges.length > 0) {
    context += `## Competitor Changes (${data.competitorChanges.length})\n`;
    data.competitorChanges.forEach(c => {
      context += `- **${c.competitorName}**: ${c.changeType}\n`;
      context += `  - Impact: ${c.impactScore}/100\n`;
      context += `  - Summary: ${c.summary}\n`;
      context += `  - URL: ${c.url}\n\n`;
    });
  }

  // Viral content
  const topViral = data.viralContent
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5);
  if (topViral.length > 0) {
    context += `## Viral Content (Last 24h)\n`;
    topViral.forEach(v => {
      context += `- **${v.title}** on ${v.platform}\n`;
      context += `  - Engagement: ${v.engagementScore}\n`;
      context += `  - Why Viral: ${v.whyViral.substring(0, 100)}...\n`;
      context += `  - Content Ideas: ${v.contentIdeas.join(', ').substring(0, 100)}...\n`;
      context += `  - URL: ${v.url}\n\n`;
    });
  }

  return context;
}

/**
 * Uses AI to intelligently rank and select top 5 daily actions
 */
async function rankActionsWithAI(
  context: string,
  data: IntelligenceData
): Promise<DailyAction[]> {
  const model = await getAIModel();

  const prompt = `You are a GTM intelligence analyst. Based on the intelligence data below, select and rank the TOP 5 most impactful actions for today.

${context}

RANKING CRITERIA:
1. **Impact Potential** (40%): How much could this action move the needle?
   - High-engagement threads with buying intent = highest impact
   - New relevant communities with large active members = high impact
   - Viral content insights = medium-high impact
   - Competitor changes = varies by impact score

2. **Urgency** (30%): How time-sensitive is this?
   - Recent high-engagement threads (< 6 hours old) = very urgent
   - New community discoveries = moderately urgent
   - Viral content (still trending) = urgent
   - Competitor changes = varies

3. **Effort vs Reward** (30%): What's the ROI on time invested?
   - Quick wins (5-15 min high-impact actions) = prioritize
   - Time-intensive low-impact = deprioritize

SELECT EXACTLY 5 ACTIONS. Consider:
- At least 2-3 keyword mention engagement opportunities (if available)
- At least 1 new community to join (if available)
- Viral content analysis or competitor monitoring as needed

For each action, provide:
1. Type: engage_thread, join_community, monitor_competitor, publish_content, or analyze_viral
2. Title: Clear, action-oriented (e.g., "Reply to hot thread in r/SaaS")
3. Description: Specific details (what to do, why it matters)
4. Priority: high, medium, or low
5. Estimated Time: 5min, 15min, or 30min
6. URL: Direct link to take action
7. Source ID: The ID from the intelligence data

Respond in JSON format:
{
  "actions": [
    {
      "type": "engage_thread",
      "title": "Action title",
      "description": "Why this matters and what to do",
      "priority": "high",
      "estimatedTime": "15min",
      "url": "https://...",
      "sourceId": "id-from-data",
      "sourceType": "keyword_mention"
    }
  ],
  "reasoning": "Brief explanation of prioritization logic"
}`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.4, // Lower temperature for more consistent prioritization
  });

  // Parse JSON response
  const jsonMatch = result.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Convert to DailyAction format with IDs
  const actions: DailyAction[] = parsed.actions.map((action: any, index: number) => ({
    id: `action-${Date.now()}-${index}`,
    type: action.type,
    title: action.title,
    description: action.description,
    url: action.url,
    priority: action.priority,
    estimatedTime: action.estimatedTime,
    sourceType: action.sourceType,
    sourceId: action.sourceId,
    completed: false,
  }));

  console.log('[Daily Actions] AI Reasoning:', parsed.reasoning);

  return actions.slice(0, 5); // Ensure exactly 5 actions
}

/**
 * Mock function to generate sample daily actions for testing
 * Replace with real database queries in production
 */
export async function generateDailyActionsFromWorkspace(
  workspaceId: string
): Promise<DailyAction[]> {
  // In production, this would:
  // 1. Query keyword_mentions table for high-relevance items
  // 2. Query icp_communities table for newly discovered communities
  // 3. Query competitor_changes table for recent changes
  // 4. Query viral_content table for last 24h content
  // 5. Pass all data to generateDailyActions()

  // For now, return sample data
  const sampleData: IntelligenceData = {
    keywordMentions: [
      {
        id: 'mention-1',
        platform: 'reddit',
        url: 'https://reddit.com/r/saas/comments/example1',
        title: 'Looking for student ambassador program tools',
        content: 'Our startup needs a way to manage student ambassadors...',
        relevanceScore: 92,
        engagementScore: 45,
        suggestedReply: 'Great question! For managing student ambassadors, you want a system that...',
      },
      {
        id: 'mention-2',
        platform: 'hackernews',
        url: 'https://news.ycombinator.com/item?id=example2',
        title: 'Show HN: Campus GTM strategies that actually work',
        content: 'After running 5 ambassador programs...',
        relevanceScore: 88,
        engagementScore: 120,
        suggestedReply: 'This is spot on. One addition I\'d make is...',
      },
    ],
    communities: [
      {
        id: 'community-1',
        platform: 'reddit',
        name: 'r/GrowthHacking',
        url: 'https://reddit.com/r/GrowthHacking',
        description: 'Community for growth hackers and marketers',
        relevanceScore: 85,
        memberCount: 125000,
        engagementStrategy: 'Share data-driven case studies. Focus on tactical advice.',
      },
      {
        id: 'community-2',
        platform: 'slack',
        name: 'SaaS Growth Community',
        url: 'https://saasgrowth.slack.com',
        description: 'Private Slack for SaaS founders and growth leaders',
        relevanceScore: 90,
        memberCount: 3500,
        engagementStrategy: 'Engage in strategy discussions. Share learnings.',
      },
    ],
    competitorChanges: [
      {
        id: 'change-1',
        competitorName: 'AmbassadorPro',
        url: 'https://ambassadorpro.com/pricing',
        changeType: 'pricing',
        summary: 'Raised pricing by 30% across all tiers',
        impactScore: 75,
      },
    ],
    viralContent: [
      {
        id: 'viral-1',
        platform: 'reddit',
        url: 'https://reddit.com/r/startups/comments/viral1',
        title: 'We built a $100K MRR SaaS with zero paid ads',
        engagementScore: 450,
        whyViral: 'Authentic story, specific numbers, actionable tactics',
        contentIdeas: ['Case study format', 'Behind-the-scenes journey', 'Tactical breakdown'],
      },
    ],
  };

  return generateDailyActions(workspaceId, sampleData);
}
