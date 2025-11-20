"use server";

import { searchReddit, getSubredditPosts } from "@/lib/scraper/reddit-api";
import { searchHackerNews } from "@/lib/scraper/hackernews-api";
import { scrapeUrl } from "@/lib/scraper/jina-reader";
import { generateText } from "ai";
import { createLanguageModel } from "@/lib/ai/provider-factory";
import { getDefaultAIConfig } from "@/lib/ai/config";

export interface ContentLeaderboard {
  rank: number;
  title: string;
  url: string;
  platform: string;
  engagement: number;
  engagementScore: number; // 0-100
  viralityPotential: number; // 0-100
  whatWorked: string;
  metadata: {
    score?: number;
    comments?: number;
    points?: number;
    author?: string;
    subreddit?: string;
    created?: number;
  };
}

export interface ContentScore {
  url: string;
  title: string;
  engagementScore: number; // 0-100
  viralityPotential: number; // 0-100
  whatWorked: string[];
  whatCouldImprove: string[];
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  breakdown: {
    hook: number; // 0-100
    value: number; // 0-100
    emotion: number; // 0-100
    timing: number; // 0-100
    format: number; // 0-100
  };
}

interface PerformanceFilters {
  industry: string;
  contentType: string;
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
 * Analyze top performing content in an industry
 */
export async function analyzeTopPerformers(
  filters: PerformanceFilters
): Promise<ContentLeaderboard[]> {
  const { industry, contentType, timeframe } = filters;

  try {
    // Gather top content from platforms
    const topContent = await gatherTopContent(industry, contentType, timeframe);

    // Sort by engagement
    topContent.sort((a, b) => b.engagement - a.engagement);

    // Analyze top 20 with AI
    const leaderboard: ContentLeaderboard[] = [];

    for (let i = 0; i < Math.min(20, topContent.length); i++) {
      const content = topContent[i];

      try {
        // Analyze what worked
        const analysis = await analyzeWhatWorked(
          content.title,
          content.url,
          content.platform
        );

        // Calculate scores
        const maxEngagement = topContent[0].engagement;
        const engagementScore = Math.round((content.engagement / maxEngagement) * 100);
        const viralityPotential = calculateViralityPotential(content);

        leaderboard.push({
          rank: i + 1,
          title: content.title,
          url: content.url,
          platform: content.platform,
          engagement: content.engagement,
          engagementScore,
          viralityPotential,
          whatWorked: analysis,
          metadata: content.metadata,
        });
      } catch (error) {
        console.error(`Analysis error for ${content.title}:`, error);

        // Add with basic data if analysis fails
        const maxEngagement = topContent[0].engagement;
        leaderboard.push({
          rank: i + 1,
          title: content.title,
          url: content.url,
          platform: content.platform,
          engagement: content.engagement,
          engagementScore: Math.round((content.engagement / maxEngagement) * 100),
          viralityPotential: 50,
          whatWorked: "High engagement and discussion quality.",
          metadata: content.metadata,
        });
      }
    }

    return leaderboard;
  } catch (error) {
    console.error("Top performers analysis error:", error);
    throw new Error(
      `Failed to analyze top performers: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Gather top content from platforms
 */
async function gatherTopContent(
  industry: string,
  contentType: string,
  timeframe: string
) {
  const content: Array<{
    title: string;
    url: string;
    platform: string;
    engagement: number;
    metadata: Record<string, any>;
  }> = [];

  const subredditMap: Record<string, string[]> = {
    technology: ["technology", "programming", "artificial", "startups"],
    marketing: ["marketing", "growthhacking", "digitalnomad", "socialmedia"],
    education: ["education", "college", "GetStudying", "AskAcademia"],
    business: ["business", "Entrepreneur", "startups", "smallbusiness"],
    design: ["design", "web_design", "userexperience", "graphic_design"],
    saas: ["SaaS", "startups", "Entrepreneur", "indiehackers"],
  };

  const subreddits = subredditMap[industry.toLowerCase()] || ["all"];
  const cutoffTime = getCutoffTimestamp(timeframe);

  // Gather Reddit content
  for (const subreddit of subreddits.slice(0, 3)) {
    try {
      const posts = await getSubredditPosts(subreddit, "top", 50);
      const filteredPosts = posts.filter((p) => p.created_utc >= cutoffTime);

      for (const post of filteredPosts) {
        // Filter by content type if needed
        if (contentType && contentType !== "all") {
          const matchesType = matchesContentType(post.title, contentType);
          if (!matchesType) continue;
        }

        content.push({
          title: post.title,
          url: post.url,
          platform: "reddit",
          engagement: post.score + post.num_comments * 2,
          metadata: {
            score: post.score,
            comments: post.num_comments,
            author: post.author,
            subreddit: post.subreddit,
            created: post.created_utc,
          },
        });
      }
    } catch (error) {
      console.error(`Reddit subreddit ${subreddit} error:`, error);
    }
  }

  // Gather HackerNews content
  const keywordMap: Record<string, string[]> = {
    technology: ["AI", "startup", "tech", "software"],
    marketing: ["marketing", "growth", "brand", "viral"],
    education: ["education", "learning", "student", "course"],
    business: ["startup", "business", "founder", "revenue"],
    design: ["design", "UI", "UX", "interface"],
    saas: ["SaaS", "product", "launch", "startup"],
  };

  const keywords = keywordMap[industry.toLowerCase()] || [industry];

  for (const keyword of keywords.slice(0, 2)) {
    try {
      const result = await searchHackerNews(keyword, {
        tags: "story",
        numericFilters: `created_at_i>${cutoffTime},points>20`,
        hitsPerPage: 50,
      });

      for (const story of result.hits) {
        // Filter by content type if needed
        if (contentType && contentType !== "all") {
          const matchesType = matchesContentType(story.title, contentType);
          if (!matchesType) continue;
        }

        if (story.url) {
          content.push({
            title: story.title,
            url: story.url,
            platform: "hackernews",
            engagement: story.points + story.num_comments * 3,
            metadata: {
              points: story.points,
              comments: story.num_comments,
              author: story.author,
              created: story.created_at_i,
            },
          });
        }
      }
    } catch (error) {
      console.error(`HN keyword ${keyword} error:`, error);
    }
  }

  return content;
}

/**
 * Check if content matches type
 */
function matchesContentType(title: string, contentType: string): boolean {
  const lowerTitle = title.toLowerCase();
  const lowerType = contentType.toLowerCase();

  if (lowerType === "question") {
    return (
      lowerTitle.includes("?") ||
      lowerTitle.startsWith("ask") ||
      lowerTitle.includes("how to") ||
      lowerTitle.includes("why") ||
      lowerTitle.includes("what")
    );
  } else if (lowerType === "story") {
    return (
      lowerTitle.includes("story") ||
      lowerTitle.includes("journey") ||
      lowerTitle.includes("experience") ||
      lowerTitle.includes("my")
    );
  } else if (lowerType === "how-to") {
    return (
      lowerTitle.includes("how to") ||
      lowerTitle.includes("guide") ||
      lowerTitle.includes("tutorial") ||
      lowerTitle.includes("tips")
    );
  } else if (lowerType === "announcement") {
    return (
      lowerTitle.includes("launch") ||
      lowerTitle.includes("release") ||
      lowerTitle.includes("announcing") ||
      lowerTitle.includes("new")
    );
  }

  return true; // "all" or unknown type
}

/**
 * Get cutoff timestamp based on timeframe
 */
function getCutoffTimestamp(timeframe: string): number {
  const now = Math.floor(Date.now() / 1000);
  const timeMap: Record<string, number> = {
    day: 86400,
    week: 604800,
    month: 2592000,
  };
  return now - (timeMap[timeframe] || timeMap.week);
}

/**
 * Analyze what made the content work
 */
async function analyzeWhatWorked(
  title: string,
  url: string,
  platform: string
): Promise<string> {
  try {
    const model = await getAIModel();

    const prompt = `You are a viral content expert analyzing a top-performing post.

Platform: ${platform}
Title: ${title}
URL: ${url}

Analyze WHY this content performed so well. Focus on:
1. The hook/headline (what grabbed attention?)
2. The value proposition (what did people get from it?)
3. The emotional trigger (curiosity, controversy, utility, inspiration?)
4. The content structure (format that worked)

Provide a concise 2-3 sentence analysis of what worked.

Respond in JSON format:
{
  "analysis": "Concise explanation of what made this content successful..."
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.analysis || "Strong engagement and clear value proposition.";
    }

    return "High-quality content that resonated with the target audience.";
  } catch (error) {
    console.error("Analysis error:", error);
    return "Generated strong engagement through valuable insights and clear presentation.";
  }
}

/**
 * Calculate virality potential based on engagement patterns
 */
function calculateViralityPotential(content: {
  engagement: number;
  metadata: Record<string, any>;
}): number {
  let score = 50; // Base score

  // Factor 1: Comment-to-score ratio (engagement depth)
  const comments = content.metadata.comments || content.metadata.num_comments || 0;
  const points = content.metadata.score || content.metadata.points || 0;

  if (points > 0) {
    const ratio = comments / points;

    if (ratio > 0.5) score += 15; // High discussion
    else if (ratio > 0.2) score += 10; // Good discussion
    else if (ratio > 0.1) score += 5; // Some discussion
  }

  // Factor 2: Absolute engagement level
  if (content.engagement > 1000) score += 20;
  else if (content.engagement > 500) score += 15;
  else if (content.engagement > 200) score += 10;
  else if (content.engagement > 100) score += 5;

  // Factor 3: Recency (more recent = higher potential for continued growth)
  const created = content.metadata.created || content.metadata.created_utc || 0;
  if (created > 0) {
    const ageInHours = (Date.now() / 1000 - created) / 3600;

    if (ageInHours < 24) score += 10; // Very fresh
    else if (ageInHours < 72) score += 5; // Still recent
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Score any content URL
 */
export async function scoreContent(contentUrl: string): Promise<ContentScore> {
  try {
    // Scrape the URL
    const scraped = await scrapeUrl(contentUrl);

    // Analyze with AI
    const model = await getAIModel();

    const prompt = `You are a content performance expert analyzing a piece of content.

Title: ${scraped.title}
URL: ${contentUrl}
Content Preview: ${scraped.content.substring(0, 2000)}

Analyze this content across 5 dimensions (score each 0-100):

1. HOOK (0-100): How attention-grabbing is the opening/headline?
2. VALUE (0-100): How much practical value does it provide?
3. EMOTION (0-100): How well does it trigger emotional response?
4. TIMING (0-100): How relevant/timely is the topic?
5. FORMAT (0-100): How well-structured and readable is it?

Also provide:
- WHAT WORKED: 3-4 specific things that made this content effective
- WHAT COULD IMPROVE: 3-4 specific improvement suggestions
- OVERALL GRADE: A+, A, B, C, or D

Respond in JSON format:
{
  "scores": {
    "hook": 85,
    "value": 90,
    "emotion": 75,
    "timing": 80,
    "format": 88
  },
  "whatWorked": [
    "Specific thing 1",
    "Specific thing 2",
    "Specific thing 3"
  ],
  "whatCouldImprove": [
    "Specific improvement 1",
    "Specific improvement 2",
    "Specific improvement 3"
  ],
  "grade": "A"
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Calculate overall scores
    const breakdown = {
      hook: parsed.scores?.hook || 70,
      value: parsed.scores?.value || 70,
      emotion: parsed.scores?.emotion || 70,
      timing: parsed.scores?.timing || 70,
      format: parsed.scores?.format || 70,
    };

    const avgScore =
      (breakdown.hook +
        breakdown.value +
        breakdown.emotion +
        breakdown.timing +
        breakdown.format) /
      5;

    const engagementScore = Math.round(avgScore);
    const viralityPotential = Math.round(
      (breakdown.hook * 0.3 +
        breakdown.emotion * 0.3 +
        breakdown.timing * 0.2 +
        breakdown.value * 0.1 +
        breakdown.format * 0.1)
    );

    return {
      url: contentUrl,
      title: scraped.title,
      engagementScore,
      viralityPotential,
      whatWorked: parsed.whatWorked || [
        "Clear value proposition",
        "Strong headline",
        "Good structure",
      ],
      whatCouldImprove: parsed.whatCouldImprove || [
        "Add more examples",
        "Improve formatting",
        "Strengthen call-to-action",
      ],
      overallGrade: (parsed.grade as ContentScore['overallGrade']) || "B",
      breakdown,
    };
  } catch (error) {
    console.error("Content scoring error:", error);

    // Return fallback score
    return {
      url: contentUrl,
      title: "Unable to fetch title",
      engagementScore: 50,
      viralityPotential: 50,
      whatWorked: [
        "Content appears to be accessible",
        "URL structure is clean",
      ],
      whatCouldImprove: [
        "Unable to analyze full content",
        "Consider improving metadata",
      ],
      overallGrade: "C",
      breakdown: {
        hook: 50,
        value: 50,
        emotion: 50,
        timing: 50,
        format: 50,
      },
    };
  }
}

/**
 * Identify winning formulas from top performers
 */
export async function extractWinningFormulas(
  leaderboard: ContentLeaderboard[]
): Promise<{
  commonPatterns: string[];
  hookPatterns: string[];
  formatPatterns: string[];
  recommendations: string[];
}> {
  try {
    const model = await getAIModel();

    // Prepare data for AI
    const topTitles = leaderboard
      .slice(0, 10)
      .map((item, idx) => `${idx + 1}. ${item.title} (${item.engagement} engagement)`)
      .join('\n');

    const prompt = `You are a content strategist analyzing top-performing content patterns.

Top 10 Performing Titles:
${topTitles}

Identify patterns and formulas that made this content successful:

1. COMMON PATTERNS: What themes/topics appear multiple times?
2. HOOK PATTERNS: What headline/title structures work best?
3. FORMAT PATTERNS: What content structures are winning?
4. RECOMMENDATIONS: 5 specific actions to replicate this success

Respond in JSON format:
{
  "commonPatterns": ["Pattern 1", "Pattern 2", "Pattern 3"],
  "hookPatterns": ["Hook pattern 1", "Hook pattern 2", "Hook pattern 3"],
  "formatPatterns": ["Format pattern 1", "Format pattern 2"],
  "recommendations": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"]
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        commonPatterns: parsed.commonPatterns || [],
        hookPatterns: parsed.hookPatterns || [],
        formatPatterns: parsed.formatPatterns || [],
        recommendations: parsed.recommendations || [],
      };
    }

    return getFallbackFormulas();
  } catch (error) {
    console.error("Formula extraction error:", error);
    return getFallbackFormulas();
  }
}

/**
 * Get fallback formulas without AI
 */
function getFallbackFormulas() {
  return {
    commonPatterns: [
      "Problem-solution content performs well",
      "Data-driven insights generate engagement",
      "Contrarian takes spark discussion",
    ],
    hookPatterns: [
      "Question-based headlines drive curiosity",
      "Number-based headlines promise clear value",
      "Controversy or bold statements grab attention",
    ],
    formatPatterns: [
      "How-to guides with clear steps",
      "Case studies with real examples",
      "Lists with actionable items",
    ],
    recommendations: [
      "Start with a strong, specific hook",
      "Provide clear, actionable value",
      "Use data or examples to support claims",
      "Optimize for your platform's best practices",
      "Post during peak engagement times",
    ],
  };
}
