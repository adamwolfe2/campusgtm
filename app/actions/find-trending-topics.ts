"use server";

import { searchReddit, getSubredditPosts } from "@/lib/scraper/reddit-api";
import { searchHackerNews } from "@/lib/scraper/hackernews-api";
import { searchWeb } from "@/lib/scraper/jina-reader";
import { generateText } from "ai";
import { createLanguageModel } from "@/lib/ai/provider-factory";
import { getDefaultAIConfig } from "@/lib/ai/config";

export interface TrendingTopic {
  topic: string;
  platforms: string[];
  postCount: number;
  totalEngagement: number;
  momentum: 'rising' | 'peaking' | 'declining';
  shelfLife: string;
  saturationLevel: 'low' | 'medium' | 'high';
  suggestedAngles: string[];
  keywords: string[];
  topPosts: {
    platform: string;
    title: string;
    url: string;
    engagement: number;
  }[];
}

interface TrendingTopicFilters {
  industry: string;
  timeframe: 'day' | 'week' | 'month';
}

/**
 * Helper function to get AI model for analysis
 */
async function getAIModel() {
  const config = getDefaultAIConfig();
  if (!config) {
    throw new Error("No AI provider configured. Please set up your API keys.");
  }
  return createLanguageModel(config);
}

/**
 * Find trending topics across Reddit, HackerNews, and web
 */
export async function findTrendingTopics(
  filters: TrendingTopicFilters
): Promise<TrendingTopic[]> {
  const { industry, timeframe } = filters;

  try {
    // Gather raw data from all platforms
    const rawData = await gatherTopicData(industry, timeframe);

    // Extract common themes and keywords using AI
    const topicClusters = await extractTopicClusters(rawData);

    // Analyze each topic cluster
    const trendingTopics = await Promise.all(
      topicClusters.map((cluster) => analyzeTopicMomentum(cluster))
    );

    // Sort by total engagement
    return trendingTopics.sort((a, b) => b.totalEngagement - a.totalEngagement);
  } catch (error) {
    console.error("Trending topics error:", error);
    throw new Error(
      `Failed to find trending topics: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Gather raw topic data from all platforms
 */
async function gatherTopicData(industry: string, timeframe: string) {
  const subredditMap: Record<string, string[]> = {
    technology: ["technology", "programming", "artificial", "MachineLearning"],
    marketing: ["marketing", "growthhacking", "socialmedia", "content"],
    education: ["education", "college", "studentlife", "GetStudying"],
    business: ["business", "Entrepreneur", "startups", "smallbusiness"],
    design: ["design", "web_design", "userexperience", "typography"],
    saas: ["SaaS", "startups", "Entrepreneur", "indiehackers"],
  };

  const keywordMap: Record<string, string[]> = {
    technology: ["AI", "software", "tech", "developer"],
    marketing: ["marketing", "growth", "viral", "content"],
    education: ["education", "learning", "student", "university"],
    business: ["startup", "business", "founder", "revenue"],
    design: ["design", "UI", "UX", "interface"],
    saas: ["SaaS", "software", "product", "startup"],
  };

  const subreddits = subredditMap[industry.toLowerCase()] || ["all"];
  const keywords = keywordMap[industry.toLowerCase()] || [industry];

  const allPosts: Array<{
    platform: string;
    title: string;
    content: string;
    url: string;
    engagement: number;
    created: number;
  }> = [];

  // Fetch Reddit data
  const redditTimeMap: Record<string, 'hour' | 'day' | 'week' | 'month'> = {
    day: 'day',
    week: 'week',
    month: 'month',
  };

  for (const subreddit of subreddits.slice(0, 3)) {
    try {
      const posts = await getSubredditPosts(subreddit, "top", 25);

      // Filter by timeframe
      const cutoffTime = getCutoffTimestamp(timeframe);
      const filteredPosts = posts.filter(p => p.created_utc >= cutoffTime);

      allPosts.push(
        ...filteredPosts.map((p) => ({
          platform: "reddit",
          title: p.title,
          content: p.selftext,
          url: p.url,
          engagement: p.score + p.num_comments * 2,
          created: p.created_utc,
        }))
      );
    } catch (error) {
      console.error(`Reddit subreddit ${subreddit} error:`, error);
    }
  }

  // Fetch HackerNews data
  for (const keyword of keywords.slice(0, 2)) {
    try {
      const result = await searchHackerNews(keyword, {
        tags: "story",
        numericFilters: `created_at_i>${getCutoffTimestamp(timeframe)}`,
        hitsPerPage: 20,
      });

      allPosts.push(
        ...result.hits.map((s) => ({
          platform: "hackernews",
          title: s.title,
          content: s.story_text || "",
          url: s.url || "",
          engagement: s.points + s.num_comments * 3,
          created: s.created_at_i,
        }))
      );
    } catch (error) {
      console.error(`HN keyword ${keyword} error:`, error);
    }
  }

  // Fetch web trending articles (using Jina search)
  try {
    const searchQuery = `trending ${industry} ${timeframe === 'day' ? 'today' : timeframe === 'week' ? 'this week' : 'this month'}`;
    const webResult = await searchWeb(searchQuery);

    // Parse search results for topics
    const lines = webResult.content.split('\n').filter(line => line.trim());
    lines.slice(0, 10).forEach((line, idx) => {
      if (line.length > 20) {
        allPosts.push({
          platform: "web",
          title: line.substring(0, 200),
          content: "",
          url: `https://search/${idx}`,
          engagement: 50, // Estimated baseline
          created: Math.floor(Date.now() / 1000),
        });
      }
    });
  } catch (error) {
    console.error("Web search error:", error);
  }

  return allPosts;
}

/**
 * Get cutoff timestamp based on timeframe
 */
function getCutoffTimestamp(timeframe: string): number {
  const now = Math.floor(Date.now() / 1000);
  const timeMap: Record<string, number> = {
    day: 86400,      // 24 hours
    week: 604800,    // 7 days
    month: 2592000,  // 30 days
  };
  return now - (timeMap[timeframe] || timeMap.week);
}

/**
 * Extract topic clusters from raw data using AI
 */
async function extractTopicClusters(
  posts: Array<{
    platform: string;
    title: string;
    content: string;
    url: string;
    engagement: number;
    created: number;
  }>
): Promise<Array<{
  topic: string;
  posts: typeof posts;
  keywords: string[];
}>> {
  try {
    const model = await getAIModel();

    // Prepare data for AI
    const postTitles = posts.slice(0, 100).map((p, idx) => `${idx + 1}. ${p.title}`).join('\n');

    const prompt = `You are a trend analyst. Analyze these post titles and identify the top 5-8 trending topics/themes.

Post Titles:
${postTitles}

For each topic:
1. Give it a clear, catchy name (2-4 words)
2. List 3-5 related keywords
3. Explain which post numbers belong to this topic

Respond in JSON format:
{
  "topics": [
    {
      "name": "Topic name",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "postIndices": [1, 5, 12, 23]
    }
  ]
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.5,
      maxTokens: 1500,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const clusters: Array<{
      topic: string;
      posts: typeof posts;
      keywords: string[];
    }> = [];

    for (const topicData of parsed.topics || []) {
      const topicPosts = (topicData.postIndices || [])
        .map((idx: number) => posts[idx - 1])
        .filter(Boolean);

      if (topicPosts.length > 0) {
        clusters.push({
          topic: topicData.name,
          posts: topicPosts,
          keywords: topicData.keywords || [],
        });
      }
    }

    return clusters.length > 0 ? clusters : createFallbackClusters(posts);
  } catch (error) {
    console.error("Topic clustering error:", error);
    return createFallbackClusters(posts);
  }
}

/**
 * Create fallback clusters based on simple keyword matching
 */
function createFallbackClusters(
  posts: Array<{
    platform: string;
    title: string;
    content: string;
    url: string;
    engagement: number;
    created: number;
  }>
) {
  // Simple keyword-based clustering
  const commonKeywords = ["AI", "startup", "marketing", "design", "product", "growth"];
  const clusters: Array<{
    topic: string;
    posts: typeof posts;
    keywords: string[];
  }> = [];

  for (const keyword of commonKeywords) {
    const matchingPosts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(keyword.toLowerCase()) ||
        p.content.toLowerCase().includes(keyword.toLowerCase())
    );

    if (matchingPosts.length >= 2) {
      clusters.push({
        topic: `${keyword} Trends`,
        posts: matchingPosts,
        keywords: [keyword],
      });
    }
  }

  // If still no clusters, create one generic cluster
  if (clusters.length === 0) {
    clusters.push({
      topic: "Trending Discussions",
      posts: posts.slice(0, 10),
      keywords: ["trending", "popular"],
    });
  }

  return clusters;
}

/**
 * Analyze topic momentum and predict trajectory
 */
export async function analyzeTopicMomentum(cluster: {
  topic: string;
  posts: Array<{
    platform: string;
    title: string;
    content: string;
    url: string;
    engagement: number;
    created: number;
  }>;
  keywords: string[];
}): Promise<TrendingTopic> {
  try {
    const model = await getAIModel();

    // Calculate engagement metrics
    const totalEngagement = cluster.posts.reduce((sum, p) => sum + p.engagement, 0);
    const platforms = [...new Set(cluster.posts.map((p) => p.platform))];
    const postCount = cluster.posts.length;

    // Analyze momentum based on post timing
    const now = Math.floor(Date.now() / 1000);
    const recentPosts = cluster.posts.filter((p) => now - p.created < 86400).length;
    const oldPosts = cluster.posts.filter((p) => now - p.created > 172800).length;

    let momentum: 'rising' | 'peaking' | 'declining' = 'peaking';
    if (recentPosts > oldPosts) {
      momentum = 'rising';
    } else if (oldPosts > recentPosts * 2) {
      momentum = 'declining';
    }

    // Get AI analysis
    const topPostTitles = cluster.posts
      .slice(0, 5)
      .map((p) => `- ${p.title}`)
      .join('\n');

    const prompt = `You are a content strategist analyzing a trending topic.

Topic: ${cluster.topic}
Keywords: ${cluster.keywords.join(', ')}
Post Count: ${postCount}
Momentum: ${momentum}

Sample Posts:
${topPostTitles}

Analyze this topic and provide:

1. SHELF LIFE: How long will this topic remain relevant? (e.g., "2-3 days", "1-2 weeks", "ongoing")
2. SATURATION: How many people are already talking about it? (low/medium/high)
3. UNIQUE ANGLES: 5 specific content angles to stand out from the crowd

Respond in JSON format:
{
  "shelfLife": "timeframe",
  "saturation": "low|medium|high",
  "angles": [
    "Specific angle 1",
    "Specific angle 2",
    "Specific angle 3",
    "Specific angle 4",
    "Specific angle 5"
  ]
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 600,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    let shelfLife = "1-2 weeks";
    let saturation: 'low' | 'medium' | 'high' = "medium";
    let suggestedAngles: string[] = [
      "Create a contrarian take on this topic",
      "Share a personal story related to this trend",
      "Provide a beginner's guide to this topic",
      "Compare this to a similar trend from the past",
      "Predict where this trend is heading next",
    ];

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        shelfLife = parsed.shelfLife || shelfLife;
        saturation = parsed.saturation || saturation;
        suggestedAngles = parsed.angles || suggestedAngles;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
      }
    }

    // Get top posts for display
    const topPosts = cluster.posts
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3)
      .map((p) => ({
        platform: p.platform,
        title: p.title,
        url: p.url,
        engagement: p.engagement,
      }));

    return {
      topic: cluster.topic,
      platforms,
      postCount,
      totalEngagement,
      momentum,
      shelfLife,
      saturationLevel: saturation,
      suggestedAngles,
      keywords: cluster.keywords,
      topPosts,
    };
  } catch (error) {
    console.error("Momentum analysis error:", error);

    // Return basic analysis without AI
    return {
      topic: cluster.topic,
      platforms: [...new Set(cluster.posts.map((p) => p.platform))],
      postCount: cluster.posts.length,
      totalEngagement: cluster.posts.reduce((sum, p) => sum + p.engagement, 0),
      momentum: 'peaking',
      shelfLife: "1-2 weeks",
      saturationLevel: "medium",
      suggestedAngles: [
        "Create a unique take on this topic",
        "Share your personal experience",
        "Provide actionable tips",
      ],
      keywords: cluster.keywords,
      topPosts: cluster.posts
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 3)
        .map((p) => ({
          platform: p.platform,
          title: p.title,
          url: p.url,
          engagement: p.engagement,
        })),
    };
  }
}
