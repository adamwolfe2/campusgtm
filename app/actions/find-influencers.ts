"use server";

import { searchReddit, searchSubreddits } from "@/lib/scraper/reddit-api";
import { searchWeb, scrapeUrl } from "@/lib/scraper/jina-reader";
import { generateText } from "ai";
import { getAIModel } from "@/lib/ai/provider-factory";

export interface InfluencerFilters {
  niche: string; // "SaaS marketing", "college tech"
  platform: 'twitter' | 'linkedin' | 'youtube' | 'instagram' | 'tiktok' | 'all';
  minFollowers: number; // 1000 (micro-influencer threshold)
  maxFollowers: number; // 100000 (before they're too expensive)
  engagementRate?: number; // minimum 2%
  location?: string; // "United States", "Europe"
}

export interface InfluencerResult {
  name: string;
  handle: string;
  platform: string;
  followerCount: number;
  estimatedEngagementRate: number;
  niche: string;
  profileUrl: string;
  recentTopics: string[]; // Topics they discuss
  audienceDemographics: string; // "College students, tech-savvy"
  brandFitScore: number; // 0-100
  outreachStrategy: string; // AI-generated personalized approach
  estimatedCost: string; // "$50-200 per post" or "Might do for free product"
}

/**
 * Main discovery function for finding micro-influencers
 * Uses multi-stage discovery: Reddit power users -> Social profile matching -> Web search
 */
export async function findMicroInfluencers(
  filters: InfluencerFilters
): Promise<InfluencerResult[]> {
  const influencers: InfluencerResult[] = [];

  try {
    // Step 1: Reddit Discovery - Find power users in relevant subreddits
    const redditInfluencers = await findRedditPowerUsers(filters);
    influencers.push(...redditInfluencers);

    // Step 2: Web Search - Search for micro-influencers directly
    const webInfluencers = await searchWebForInfluencers(filters);
    influencers.push(...webInfluencers);

    // Step 3: Deduplicate and sort by brand fit score
    const uniqueInfluencers = Array.from(
      new Map(influencers.map(i => [i.handle.toLowerCase(), i])).values()
    );

    uniqueInfluencers.sort((a, b) => b.brandFitScore - a.brandFitScore);

    return uniqueInfluencers.slice(0, 30); // Top 30 results
  } catch (error) {
    console.error('Influencer finding error:', error);
    throw new Error(
      `Failed to find influencers: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Find power users on Reddit in relevant communities
 * High karma + active = potential influencers
 */
async function findRedditPowerUsers(
  filters: InfluencerFilters
): Promise<InfluencerResult[]> {
  const influencers: InfluencerResult[] = [];

  try {
    // Find relevant subreddits for the niche
    const subreddits = await searchSubreddits(filters.niche, 5);

    // Search posts in relevant communities to find active users
    for (const subreddit of subreddits.slice(0, 3)) {
      try {
        // Search for highly engaged posts in this subreddit
        const searchResults = await searchReddit(filters.niche, {
          subreddit: subreddit.display_name,
          sort: 'top',
          time: 'month',
          limit: 20,
        });

        // Analyze top contributors
        const userAnalysis = await analyzeRedditUsers(
          searchResults.posts,
          filters
        );

        influencers.push(...userAnalysis);
      } catch (error) {
        console.error(`Reddit analysis error for ${subreddit.display_name}:`, error);
      }
    }

    return influencers;
  } catch (error) {
    console.error('Reddit power user discovery error:', error);
    return [];
  }
}

/**
 * Analyze Reddit users and extract potential influencer profiles
 */
async function analyzeRedditUsers(
  posts: any[],
  filters: InfluencerFilters
): Promise<InfluencerResult[]> {
  try {
    const model = await getAIModel();

    // Group posts by author to find consistent contributors
    const userPosts = new Map<string, any[]>();
    posts.forEach(post => {
      if (!userPosts.has(post.author)) {
        userPosts.set(post.author, []);
      }
      userPosts.get(post.author)!.push(post);
    });

    // Filter to users with multiple high-engagement posts
    const powerUsers = Array.from(userPosts.entries())
      .filter(([author, posts]) => {
        const totalScore = posts.reduce((sum, p) => sum + p.score, 0);
        return posts.length >= 2 && totalScore > 100 && author !== '[deleted]';
      })
      .slice(0, 5); // Top 5 power users

    const influencers: InfluencerResult[] = [];

    for (const [author, posts] of powerUsers) {
      try {
        // Use AI to analyze user and extract social handles
        const analysis = await analyzeUserProfile(author, posts, filters);
        if (analysis) {
          influencers.push(analysis);
        }
      } catch (error) {
        console.error(`User analysis error for ${author}:`, error);
      }
    }

    return influencers;
  } catch (error) {
    console.error('Reddit user analysis error:', error);
    return [];
  }
}

/**
 * Analyze a Reddit user's profile and extract influencer information
 */
async function analyzeUserProfile(
  username: string,
  posts: any[],
  filters: InfluencerFilters
): Promise<InfluencerResult | null> {
  try {
    const model = await getAIModel();

    // Combine post content for analysis
    const postContent = posts
      .map(p => `Title: ${p.title}\nContent: ${p.selftext.substring(0, 500)}\nScore: ${p.score}`)
      .join('\n\n---\n\n')
      .substring(0, 4000);

    const prompt = `Analyze this Reddit power user to determine if they could be a micro-influencer:

Username: u/${username}
Niche: ${filters.niche}
Target Platform: ${filters.platform === 'all' ? 'Any' : filters.platform}

Recent Posts:
${postContent}

Analyze this user and provide:
1. Their main topics/expertise
2. Estimated follower range (if they have social media presence)
3. Likely social media handles (infer from username and content)
4. Audience demographics
5. Brand fit score (0-100) for the niche "${filters.niche}"
6. Outreach strategy

If this person seems like a legitimate micro-influencer (scores above 60), respond in JSON format:
{
  "isInfluencer": true,
  "name": "Inferred name or username",
  "handle": "username or inferred social handle",
  "platform": "twitter/linkedin/youtube/instagram/tiktok",
  "followerCount": 5000,
  "estimatedEngagementRate": 4.5,
  "recentTopics": ["topic1", "topic2", "topic3"],
  "audienceDemographics": "Description of their audience",
  "brandFitScore": 85,
  "outreachStrategy": "Personalized approach based on their content",
  "estimatedCost": "$100-300 per post"
}

If they don't seem like an influencer (score below 60), respond with:
{"isInfluencer": false}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.isInfluencer) {
        return null;
      }

      return {
        name: parsed.name || username,
        handle: parsed.handle || username,
        platform: parsed.platform || 'reddit',
        followerCount: parsed.followerCount || 0,
        estimatedEngagementRate: parsed.estimatedEngagementRate || 3.0,
        niche: filters.niche,
        profileUrl: `https://reddit.com/u/${username}`,
        recentTopics: parsed.recentTopics || [],
        audienceDemographics: parsed.audienceDemographics || 'Reddit community members',
        brandFitScore: parsed.brandFitScore || 50,
        outreachStrategy: parsed.outreachStrategy || 'Direct message with value proposition',
        estimatedCost: parsed.estimatedCost || 'Possibly free for product/exposure',
      };
    }

    return null;
  } catch (error) {
    console.error('User profile analysis error:', error);
    return null;
  }
}

/**
 * Search web for micro-influencers using Jina
 */
async function searchWebForInfluencers(
  filters: InfluencerFilters
): Promise<InfluencerResult[]> {
  const influencers: InfluencerResult[] = [];

  try {
    // Build search query
    const platformQuery = filters.platform === 'all' ? '' : filters.platform;
    const searchQuery = `${filters.niche} micro influencers ${platformQuery} ${filters.minFollowers}-${filters.maxFollowers} followers`;

    // Search web
    const searchResults = await searchWeb(searchQuery);

    // Use AI to extract influencer profiles from search results
    const extractedInfluencers = await extractInfluencersFromText(
      searchResults.content,
      filters
    );

    influencers.push(...extractedInfluencers);

    return influencers;
  } catch (error) {
    console.error('Web influencer search error:', error);
    return [];
  }
}

/**
 * Extract influencer information from web search results using AI
 */
async function extractInfluencersFromText(
  searchText: string,
  filters: InfluencerFilters
): Promise<InfluencerResult[]> {
  try {
    const model = await getAIModel();

    const prompt = `Extract micro-influencer profiles from this search result text:

${searchText.substring(0, 10000)}

Filters:
- Niche: ${filters.niche}
- Platform: ${filters.platform}
- Follower Range: ${filters.minFollowers} - ${filters.maxFollowers}
- Min Engagement Rate: ${filters.engagementRate || 2}%
${filters.location ? `- Location: ${filters.location}` : ''}

Extract ONLY micro-influencers (not mega-influencers or brands).
For each influencer found, extract:
1. Name
2. Handle/Username
3. Platform (twitter, linkedin, youtube, instagram, tiktok)
4. Follower count (estimate if not exact)
5. Engagement rate (estimate if not mentioned)
6. Profile URL
7. Topics they discuss
8. Audience demographics
9. Brand fit score (0-100) for "${filters.niche}"

Respond in JSON array format:
[
  {
    "name": "Jane Smith",
    "handle": "@janesmith",
    "platform": "twitter",
    "followerCount": 15000,
    "estimatedEngagementRate": 4.5,
    "profileUrl": "https://twitter.com/janesmith",
    "recentTopics": ["SaaS marketing", "growth hacking", "content strategy"],
    "audienceDemographics": "B2B marketers, startup founders, growth professionals",
    "brandFitScore": 92,
    "outreachStrategy": "Lead with case study relevant to their recent content on growth tactics",
    "estimatedCost": "$200-500 per post"
  }
]

If you can't find any influencers, return empty array [].`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Filter by follower range and engagement rate
      return parsed
        .filter((inf: any) => {
          const meetsFollowerRange =
            inf.followerCount >= filters.minFollowers &&
            inf.followerCount <= filters.maxFollowers;

          const meetsEngagement = !filters.engagementRate ||
            inf.estimatedEngagementRate >= filters.engagementRate;

          return meetsFollowerRange && meetsEngagement;
        })
        .map((inf: any) => ({
          ...inf,
          niche: filters.niche,
        }));
    }

    return [];
  } catch (error) {
    console.error('Influencer extraction error:', error);
    return [];
  }
}

/**
 * Calculate engagement rate from social metrics
 */
export function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  followers: number
): number {
  if (followers === 0) return 0;
  const totalEngagement = likes + comments * 2 + shares * 3;
  return (totalEngagement / followers) * 100;
}

/**
 * Estimate cost based on follower count and engagement
 */
export function estimateInfluencerCost(
  followerCount: number,
  engagementRate: number,
  platform: string
): string {
  // Base cost per 1000 followers
  const baseRate = {
    twitter: 10,
    linkedin: 15,
    youtube: 20,
    instagram: 12,
    tiktok: 8,
  }[platform] || 10;

  // Engagement multiplier (higher engagement = more valuable)
  const engagementMultiplier = engagementRate > 5 ? 1.5 : engagementRate > 3 ? 1.2 : 1;

  const baseCost = (followerCount / 1000) * baseRate * engagementMultiplier;
  const minCost = Math.floor(baseCost * 0.7);
  const maxCost = Math.floor(baseCost * 1.3);

  // Special case for very small influencers
  if (followerCount < 5000) {
    return 'Possibly free for product/exposure, or $50-150 per post';
  }

  return `$${minCost}-${maxCost} per post`;
}

/**
 * Quick search for influencers with basic filters
 */
export async function quickSearchInfluencers(
  niche: string,
  platform: string = 'all'
): Promise<InfluencerResult[]> {
  return findMicroInfluencers({
    niche,
    platform: platform as any,
    minFollowers: 1000,
    maxFollowers: 100000,
    engagementRate: 2,
  });
}
