"use server";

import { generateText } from "ai";
import { getAIModel } from "@/lib/ai/provider-factory";

/**
 * Weekly digest data structure
 */
export interface WeeklyDigest {
  id: string;
  workspaceId: string;
  weekStart: Date;
  weekEnd: Date;
  summary: string; // Markdown formatted AI-generated summary
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
  createdAt: Date;
}

/**
 * Weekly intelligence summary for AI processing
 */
interface WeeklyIntelligenceSummary {
  weekStart: Date;
  weekEnd: Date;
  communities: Array<{
    name: string;
    platform: string;
    memberCount: number;
    relevanceScore: number;
    discoveredAt: Date;
  }>;
  keywordMentions: Array<{
    keyword: string;
    platform: string;
    title: string;
    relevanceScore: number;
    engagementScore: number;
    detectedAt: Date;
  }>;
  viralContent: Array<{
    platform: string;
    title: string;
    engagementScore: number;
    whyViral: string;
    detectedAt: Date;
  }>;
  competitorChanges: Array<{
    competitorName: string;
    changeType: string;
    summary: string;
    impactScore: number;
    detectedAt: Date;
  }>;
  actionsCompleted: Array<{
    type: string;
    title: string;
    completedAt: Date;
  }>;
}

/**
 * Generates a weekly digest for a workspace
 * AI-generated executive summary covering the week's intelligence
 *
 * @param workspaceId - The workspace to generate digest for
 * @param weeklyData - Aggregated intelligence data for the week
 * @returns WeeklyDigest with AI-generated insights
 */
export async function generateWeeklyDigest(
  workspaceId: string,
  weeklyData: WeeklyIntelligenceSummary
): Promise<WeeklyDigest> {
  try {
    // Calculate metrics
    const metrics = {
      communitiesFound: weeklyData.communities.length,
      keywordsMonitored: new Set(weeklyData.keywordMentions.map(m => m.keyword)).size,
      viralContentDiscovered: weeklyData.viralContent.length,
      competitorChanges: weeklyData.competitorChanges.length,
      actionsCompleted: weeklyData.actionsCompleted.length,
      totalMentions: weeklyData.keywordMentions.length,
    };

    // Generate AI-powered digest
    const aiDigest = await generateDigestWithAI(weeklyData, metrics);

    // Construct final digest
    const digest: WeeklyDigest = {
      id: `digest-${Date.now()}`,
      workspaceId,
      weekStart: weeklyData.weekStart,
      weekEnd: weeklyData.weekEnd,
      summary: aiDigest.summary,
      metrics,
      topOpportunities: aiDigest.topOpportunities,
      competitiveInsights: aiDigest.competitiveInsights,
      contentTrends: aiDigest.contentTrends,
      nextWeekFocus: aiDigest.nextWeekFocus,
      createdAt: new Date(),
    };

    return digest;
  } catch (error) {
    console.error('Weekly digest generation error:', error);
    throw new Error(`Failed to generate weekly digest: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uses AI to generate executive summary and insights
 */
async function generateDigestWithAI(
  data: WeeklyIntelligenceSummary,
  metrics: WeeklyDigest['metrics']
): Promise<{
  summary: string;
  topOpportunities: Array<{ title: string; description: string; type: string }>;
  competitiveInsights: string[];
  contentTrends: string[];
  nextWeekFocus: string[];
}> {
  const model = await getAIModel();

  // Build context from weekly data
  const context = buildWeeklyContext(data, metrics);

  const prompt = `You are a Y Combinator partner writing a weekly growth digest. You have data from the past week's intelligence gathering for a B2B SaaS company.

${context}

Write an executive summary in the style of Y Combinator's weekly updates. The summary should be:
- **Professional yet conversational** - like you're talking to a fellow founder
- **Data-driven and specific** - cite actual numbers and examples
- **Actionable** - focus on what to do, not just what happened
- **Concise** - 3-4 paragraphs maximum
- **Forward-looking** - end with what's next

STRUCTURE:
1. **Opening paragraph**: Week's headline - what's the biggest win or insight?
2. **Opportunities paragraph**: Top opportunities discovered (communities, viral trends, keyword mentions)
3. **Competitive landscape**: What competitors are doing, what it means
4. **Next week's focus**: 3-4 specific recommended actions

Also identify:
- **Top 3 Opportunities**: Specific, actionable opportunities with type (community, content, engagement)
- **Competitive Insights**: 2-3 key takeaways from competitor activity
- **Content Trends**: 2-3 patterns in viral content or high-engagement topics
- **Next Week Focus**: 3-4 recommended focus areas

TONE:
- Skip the fluff. Be direct.
- Use specific numbers and examples from the data.
- Sound like Paul Graham writing a weekly update.
- No buzzwords or corporate jargon.

Respond in JSON format:
{
  "summary": "# Growth Digest - Week of [dates]\\n\\n[Markdown formatted summary with headers and bullets]",
  "topOpportunities": [
    {
      "title": "Join r/GrowthHacking community",
      "description": "125K members, high relevance (85/100). Active discussions on ambassador programs.",
      "type": "community"
    }
  ],
  "competitiveInsights": [
    "AmbassadorPro raised prices 30% - opportunity to position on value",
    "Competitors focusing on enterprise, gap in SMB market"
  ],
  "contentTrends": [
    "Case studies with specific numbers outperforming general advice 3:1",
    "Behind-the-scenes content getting 2x engagement on Reddit"
  ],
  "nextWeekFocus": [
    "Engage in top 5 high-relevance threads identified this week",
    "Join and establish presence in 2 new communities",
    "Create case study content based on viral patterns",
    "Monitor competitor pricing changes for positioning"
  ]
}`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.7,
  });

  // Parse JSON response
  const jsonMatch = result.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI digest response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    summary: parsed.summary,
    topOpportunities: parsed.topOpportunities || [],
    competitiveInsights: parsed.competitiveInsights || [],
    contentTrends: parsed.contentTrends || [],
    nextWeekFocus: parsed.nextWeekFocus || [],
  };
}

/**
 * Builds context string from weekly data
 */
function buildWeeklyContext(
  data: WeeklyIntelligenceSummary,
  metrics: WeeklyDigest['metrics']
): string {
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  let context = `# Week of ${formatDate(data.weekStart)} - ${formatDate(data.weekEnd)}\n\n`;

  // Metrics overview
  context += `## Key Metrics\n`;
  context += `- **Communities Discovered**: ${metrics.communitiesFound}\n`;
  context += `- **Keywords Monitored**: ${metrics.keywordsMonitored}\n`;
  context += `- **Total Mentions Found**: ${metrics.totalMentions}\n`;
  context += `- **Viral Content Identified**: ${metrics.viralContentDiscovered}\n`;
  context += `- **Competitor Changes**: ${metrics.competitorChanges}\n`;
  context += `- **Actions Completed**: ${metrics.actionsCompleted}\n\n`;

  // Top communities
  if (data.communities.length > 0) {
    context += `## New Communities Discovered\n`;
    data.communities
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5)
      .forEach(c => {
        context += `- **${c.name}** (${c.platform}): ${c.memberCount.toLocaleString()} members, ${c.relevanceScore}/100 relevance\n`;
      });
    context += '\n';
  }

  // High-engagement keyword mentions
  const topMentions = data.keywordMentions
    .sort((a, b) => (b.relevanceScore * b.engagementScore) - (a.relevanceScore * a.engagementScore))
    .slice(0, 5);

  if (topMentions.length > 0) {
    context += `## Top Keyword Mentions\n`;
    topMentions.forEach(m => {
      context += `- **"${m.keyword}"** on ${m.platform}: "${m.title}" (Relevance: ${m.relevanceScore}, Engagement: ${m.engagementScore})\n`;
    });
    context += '\n';
  }

  // Viral content insights
  if (data.viralContent.length > 0) {
    context += `## Viral Content Patterns\n`;
    data.viralContent
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 3)
      .forEach(v => {
        context += `- **${v.title}** (${v.platform}): ${v.engagementScore} engagement\n`;
        context += `  - Why it went viral: ${v.whyViral}\n`;
      });
    context += '\n';
  }

  // Competitor activity
  if (data.competitorChanges.length > 0) {
    context += `## Competitor Activity\n`;
    data.competitorChanges.forEach(c => {
      context += `- **${c.competitorName}** (${c.changeType}): ${c.summary} (Impact: ${c.impactScore}/100)\n`;
    });
    context += '\n';
  }

  // Actions completed
  if (data.actionsCompleted.length > 0) {
    context += `## Actions Completed This Week\n`;
    const actionsByType = data.actionsCompleted.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(actionsByType).forEach(([type, count]) => {
      context += `- ${type.replace(/_/g, ' ')}: ${count}\n`;
    });
    context += '\n';
  }

  return context;
}

/**
 * Exports digest as HTML email
 */
export async function exportDigestEmail(digest: WeeklyDigest): Promise<string> {
  // Convert markdown to simple HTML
  const htmlSummary = digest.summary
    .replace(/^# (.+)$/gm, '<h1 style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif; font-size: 24px; font-weight: 600; margin: 20px 0 10px;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif; font-size: 18px; font-weight: 600; margin: 16px 0 8px;">$1</h2>')
    .replace(/^\- (.+)$/gm, '<li style="margin: 4px 0;">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .split('\n\n')
    .map(p => p.startsWith('<') ? p : `<p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6; color: #374151; margin: 12px 0;">${p}</p>`)
    .join('\n');

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Growth Digest - ${formatDate(digest.weekStart)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 30px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827;">Campus GTM</h1>
      <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Weekly Growth Digest</p>
      <p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af;">${formatDate(digest.weekStart)} - ${formatDate(digest.weekEnd)}</p>
    </div>

    <!-- Metrics -->
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
      <h3 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Week at a Glance</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div>
          <div style="font-size: 24px; font-weight: 700; color: #111827;">${digest.metrics.communitiesFound}</div>
          <div style="font-size: 12px; color: #6b7280;">Communities Found</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 700; color: #111827;">${digest.metrics.totalMentions}</div>
          <div style="font-size: 12px; color: #6b7280;">Keyword Mentions</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 700; color: #111827;">${digest.metrics.viralContentDiscovered}</div>
          <div style="font-size: 12px; color: #6b7280;">Viral Content</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 700; color: #111827;">${digest.metrics.actionsCompleted}</div>
          <div style="font-size: 12px; color: #6b7280;">Actions Completed</div>
        </div>
      </div>
    </div>

    <!-- AI Summary -->
    <div style="margin-bottom: 30px;">
      ${htmlSummary}
    </div>

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">Generated by Campus GTM Intelligence System</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Mock function to generate sample weekly digest for testing
 */
export async function generateWeeklyDigestForWorkspace(
  workspaceId: string,
  weekOffset: number = 0 // 0 = current week, -1 = last week, etc.
): Promise<WeeklyDigest> {
  // Calculate week dates
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek + (weekOffset * 7));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Sample data for testing
  const sampleData: WeeklyIntelligenceSummary = {
    weekStart,
    weekEnd,
    communities: [
      {
        name: 'r/GrowthHacking',
        platform: 'reddit',
        memberCount: 125000,
        relevanceScore: 85,
        discoveredAt: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'SaaS Growth Community',
        platform: 'slack',
        memberCount: 3500,
        relevanceScore: 90,
        discoveredAt: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
    ],
    keywordMentions: [
      {
        keyword: 'student ambassador',
        platform: 'reddit',
        title: 'Looking for tools to manage student ambassadors',
        relevanceScore: 92,
        engagementScore: 45,
        detectedAt: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        keyword: 'campus marketing',
        platform: 'hackernews',
        title: 'Show HN: Campus GTM strategies that work',
        relevanceScore: 88,
        engagementScore: 120,
        detectedAt: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        keyword: 'ambassador program',
        platform: 'reddit',
        title: 'How we scaled to 100 campus ambassadors',
        relevanceScore: 85,
        engagementScore: 78,
        detectedAt: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000),
      },
    ],
    viralContent: [
      {
        platform: 'reddit',
        title: 'We built $100K MRR SaaS with zero paid ads',
        engagementScore: 450,
        whyViral: 'Authentic story with specific numbers and actionable tactics',
        detectedAt: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        platform: 'hackernews',
        title: 'The college marketing playbook we used to grow 10x',
        engagementScore: 320,
        whyViral: 'Tactical breakdown, transparent metrics, counterintuitive insights',
        detectedAt: new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
    ],
    competitorChanges: [
      {
        competitorName: 'AmbassadorPro',
        changeType: 'pricing',
        summary: 'Raised pricing by 30% across all tiers, focusing on enterprise',
        impactScore: 75,
        detectedAt: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
    ],
    actionsCompleted: [
      { type: 'engage_thread', title: 'Replied to r/SaaS thread', completedAt: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000) },
      { type: 'join_community', title: 'Joined Growth Hackers Slack', completedAt: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000) },
      { type: 'publish_content', title: 'Published case study', completedAt: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000) },
      { type: 'engage_thread', title: 'Replied to HN thread', completedAt: new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000) },
    ],
  };

  return generateWeeklyDigest(workspaceId, sampleData);
}
