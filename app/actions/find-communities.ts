"use server";

import { searchWeb } from "@/lib/scraper/jina-reader";
import { searchSubreddits } from "@/lib/scraper/reddit-api";
import { generateText } from "ai";
import { getAIModel } from "@/lib/ai/provider-factory";

export interface CommunityResult {
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
}

/**
 * Find communities for a given ICP using AI-powered web search
 * This is the "Perplexity-style" intelligent search agent
 */
export async function findCommunitiesForICP(icp: {
  title?: string;
  industry?: string;
  companySize?: string;
  painPoints?: string[];
  goals?: string[];
}): Promise<CommunityResult[]> {
  const communities: CommunityResult[] = [];

  try {
    // Step 1: Generate search queries using AI
    const searchQueries = await generateSearchQueries(icp);

    // Step 2: Search Reddit for subreddits
    const redditCommunities = await findRedditCommunities(searchQueries);
    communities.push(...redditCommunities);

    // Step 3: Search web for other communities (LinkedIn groups, Discord, Slack, Forums)
    const webCommunities = await findWebCommunities(searchQueries, icp);
    communities.push(...webCommunities);

    // Step 4: Deduplicate and sort by relevance
    const uniqueCommunities = Array.from(
      new Map(communities.map(c => [c.url, c])).values()
    );

    uniqueCommunities.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return uniqueCommunities.slice(0, 20); // Top 20 communities
  } catch (error) {
    console.error('Community finding error:', error);
    throw new Error(`Failed to find communities: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate smart search queries based on ICP
 */
async function generateSearchQueries(icp: {
  title?: string;
  industry?: string;
  companySize?: string;
  painPoints?: string[];
  goals?: string[];
}): Promise<string[]> {
  try {
    const model = await getAIModel();

    const prompt = `Generate 5-7 search queries to find online communities where this ICP would hang out:

ICP Profile:
- Job Title: ${icp.title || 'N/A'}
- Industry: ${icp.industry || 'N/A'}
- Company Size: ${icp.companySize || 'N/A'}
- Pain Points: ${icp.painPoints?.join(', ') || 'N/A'}
- Goals: ${icp.goals?.join(', ') || 'N/A'}

Generate queries that would find:
1. Industry-specific subreddits
2. Professional communities (LinkedIn groups, Slack workspaces)
3. Forums and discussion boards
4. Discord servers
5. Facebook groups

Be specific and actionable. Examples:
- "B2B SaaS founders community"
- "marketing automation professionals slack"
- "growth hacking forums"

Respond with just the queries, one per line.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    const queries = result.text
      .split('\n')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('-') && !q.startsWith('•'))
      .slice(0, 7);

    return queries;
  } catch (error) {
    console.error('Query generation error:', error);
    // Fallback to basic queries
    return [
      `${icp.title} community`,
      `${icp.industry} professionals forum`,
      `${icp.industry} slack discord`,
    ];
  }
}

/**
 * Find Reddit communities
 */
async function findRedditCommunities(queries: string[]): Promise<CommunityResult[]> {
  const communities: CommunityResult[] = [];

  for (const query of queries) {
    try {
      const subreddits = await searchSubreddits(query, 5);

      for (const sub of subreddits) {
        // Score activity based on subscribers and rough activity estimate
        const activityScore = Math.min(
          100,
          Math.floor((sub.subscribers / 1000) * 10)
        );

        communities.push({
          platform: 'reddit',
          name: sub.display_name,
          url: sub.url,
          description: sub.public_description || sub.title,
          memberCount: sub.subscribers,
          activityScore,
          relevanceScore: 80, // Will be refined by AI later
          engagementStrategy: await generateEngagementStrategy('reddit', sub.display_name, sub.description),
          rules: sub.description,
          bestPostingTimes: 'Weekdays 8-11am EST (highest activity)',
        });
      }
    } catch (error) {
      console.error(`Reddit search error for "${query}":`, error);
    }
  }

  return communities;
}

/**
 * Find web communities using Jina search
 */
async function findWebCommunities(
  queries: string[],
  icp: any
): Promise<CommunityResult[]> {
  const communities: CommunityResult[] = [];

  for (const query of queries) {
    try {
      // Search web for communities
      const searchResults = await searchWeb(query);

      // Use AI to extract community information from search results
      const extractedCommunities = await extractCommunitiesFromText(
        searchResults.content,
        icp
      );

      communities.push(...extractedCommunities);
    } catch (error) {
      console.error(`Web search error for "${query}":`, error);
    }
  }

  return communities;
}

/**
 * Extract community information from search results using AI
 */
async function extractCommunitiesFromText(
  searchText: string,
  icp: any
): Promise<CommunityResult[]> {
  try {
    const model = await getAIModel();

    const prompt = `Extract online communities from this search result text:

${searchText.substring(0, 8000)}

ICP Context:
- Title: ${icp.title}
- Industry: ${icp.industry}

Extract communities including:
- LinkedIn Groups
- Slack workspaces
- Discord servers
- Forums (like Indie Hackers, Product Hunt discussions)
- Facebook Groups
- Professional associations

For each community found, extract:
1. Platform (linkedin, slack, discord, forum, facebook, other)
2. Name
3. URL (if available)
4. Brief description
5. Estimated member count (if mentioned)

Respond in JSON array format:
[
  {
    "platform": "slack",
    "name": "Community Name",
    "url": "https://...",
    "description": "Brief description",
    "memberCount": 5000
  }
]

Only include legitimate, active communities. If you can't find any, return empty array [].`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return parsed.map((c: any) => ({
        platform: c.platform || 'other',
        name: c.name,
        url: c.url || '#',
        description: c.description,
        memberCount: c.memberCount || 0,
        activityScore: c.memberCount ? Math.min(100, (c.memberCount / 100)) : 50,
        relevanceScore: 75, // Default, will be refined
        engagementStrategy: '',
      }));
    }

    return [];
  } catch (error) {
    console.error('Community extraction error:', error);
    return [];
  }
}

/**
 * Generate engagement strategy for a community
 */
async function generateEngagementStrategy(
  platform: string,
  communityName: string,
  description: string
): Promise<string> {
  try {
    const model = await getAIModel();

    const prompt = `Generate a 2-3 sentence engagement strategy for this community:

Platform: ${platform}
Community: ${communityName}
Description: ${description}

Provide specific advice on:
- What type of content works best
- Tone/style (professional, casual, technical, etc.)
- How often to post
- What to avoid

Keep it concise and actionable.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    });

    return result.text.trim();
  } catch (error) {
    return 'Share valuable insights, engage authentically, and avoid promotional content.';
  }
}

/**
 * Quick find - just search Reddit for the most relevant communities
 * Faster alternative when user wants instant results
 */
export async function quickFindCommunities(industry: string, jobTitle: string): Promise<CommunityResult[]> {
  try {
    const query = `${industry} ${jobTitle}`;
    const subreddits = await searchSubreddits(query, 10);

    return subreddits
      .filter(sub => sub.subscribers > 1000) // Filter small/dead communities
      .map(sub => ({
        platform: 'reddit',
        name: sub.display_name,
        url: sub.url,
        description: sub.public_description || sub.title,
        memberCount: sub.subscribers,
        activityScore: Math.min(100, Math.floor((sub.subscribers / 1000) * 10)),
        relevanceScore: 80,
        engagementStrategy: 'Share insights and case studies. Avoid promotional posts. Engage in comments.',
        rules: sub.description,
        bestPostingTimes: 'Weekdays 8-11am EST',
      }))
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, 10);
  } catch (error) {
    console.error('Quick find error:', error);
    return [];
  }
}
