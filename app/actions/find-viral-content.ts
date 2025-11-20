"use server";

import { searchReddit, getSubredditPosts } from "@/lib/scraper/reddit-api";
import { searchHackerNews } from "@/lib/scraper/hackernews-api";
import { generateText } from "ai";
import { createLanguageModel } from "@/lib/ai/provider-factory";
import { getDefaultAIConfig } from "@/lib/ai/config";

export interface ViralContent {
  id?: string;
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
}

interface ViralContentFilters {
  industry?: string;
  contentType?: string;
  minEngagement?: number;
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
 * Find viral content across platforms
 * Searches Reddit, HackerNews, and optionally web for trending content
 */
export async function findViralContent(
  filters: ViralContentFilters = {}
): Promise<ViralContent[]> {
  const {
    industry = "technology",
    minEngagement = 50,
  } = filters;

  const viralContent: ViralContent[] = [];

  try {
    // Parallel search across platforms
    const [redditContent, hnContent] = await Promise.allSettled([
      findRedditViral(industry, minEngagement),
      findHackerNewsViral(industry, minEngagement),
    ]);

    // Combine results
    if (redditContent.status === "fulfilled") {
      viralContent.push(...redditContent.value);
    } else {
      console.error("Reddit search failed:", redditContent.reason);
    }

    if (hnContent.status === "fulfilled") {
      viralContent.push(...hnContent.value);
    } else {
      console.error("HackerNews search failed:", hnContent.reason);
    }

    // Sort by engagement score
    viralContent.sort((a, b) => b.engagementScore - a.engagementScore);

    return viralContent.slice(0, 50); // Top 50 results
  } catch (error) {
    console.error("Viral content search error:", error);
    throw new Error(
      `Failed to find viral content: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Find viral content on Reddit
 */
async function findRedditViral(
  industry: string,
  minEngagement: number
): Promise<ViralContent[]> {
  const viralContent: ViralContent[] = [];

  // Map industries to relevant subreddits
  const subredditMap: Record<string, string[]> = {
    technology: ["technology", "programming", "startups", "SaaS"],
    marketing: ["marketing", "growthhacking", "digitalnomad", "Entrepreneur"],
    education: ["education", "college", "studentlife", "AskAcademia"],
    business: ["business", "Entrepreneur", "smallbusiness", "startups"],
    design: ["design", "web_design", "userexperience", "graphic_design"],
  };

  const targetSubreddits =
    subredditMap[industry.toLowerCase()] || ["all"];

  for (const subreddit of targetSubreddits) {
    try {
      // Get top posts from last month
      const posts = await getSubredditPosts(subreddit, "top", 25);

      for (const post of posts) {
        // Filter by engagement threshold
        const engagementScore = post.score + post.num_comments * 2;
        if (engagementScore < minEngagement) continue;

        // Filter by minimum comments (indicates discussion)
        if (post.num_comments < 10) continue;

        // Analyze why it went viral
        const analysis = await analyzeContent(
          post.url || "",
          post.title,
          post.selftext
        );

        viralContent.push({
          platform: "reddit",
          url: post.url || "",
          title: post.title,
          content: post.selftext.substring(0, 500),
          author: post.author,
          engagementScore,
          whyViral: analysis.whyViral,
          contentIdeas: analysis.contentIdeas,
          metadata: {
            subreddit: post.subreddit,
            score: post.score,
            num_comments: post.num_comments,
            created_utc: post.created_utc,
          },
          detectedAt: new Date(),
        });
      }
    } catch (error) {
      console.error(`Reddit subreddit ${subreddit} error:`, error);
    }
  }

  return viralContent;
}

/**
 * Find viral content on Hacker News
 */
async function findHackerNewsViral(
  industry: string,
  minEngagement: number
): Promise<ViralContent[]> {
  const viralContent: ViralContent[] = [];

  try {
    // Search keywords related to industry
    const keywordMap: Record<string, string[]> = {
      technology: ["startup", "launch", "AI", "SaaS"],
      marketing: ["marketing", "growth", "viral", "brand"],
      education: ["education", "learning", "university", "student"],
      business: ["business", "founder", "revenue", "fundraising"],
      design: ["design", "UI", "UX", "interface"],
    };

    const keywords = keywordMap[industry.toLowerCase()] || ["startup"];

    for (const keyword of keywords) {
      try {
        const result = await searchHackerNews(keyword, {
          tags: "story",
          numericFilters: `points>${minEngagement},num_comments>10`,
          hitsPerPage: 10,
        });

        for (const story of result.hits) {
          const engagementScore = story.points + story.num_comments * 3;

          // Skip if no URL (malformed story)
          if (!story.url) continue;

          // Analyze why it went viral
          const analysis = await analyzeContent(
            story.url,
            story.title,
            story.story_text || ""
          );

          viralContent.push({
            platform: "hackernews",
            url: story.url,
            title: story.title,
            content: (story.story_text || "").substring(0, 500),
            author: story.author,
            engagementScore,
            whyViral: analysis.whyViral,
            contentIdeas: analysis.contentIdeas,
            metadata: {
              points: story.points,
              num_comments: story.num_comments,
              created_at: story.created_at,
              objectID: story.objectID,
            },
            detectedAt: new Date(),
          });
        }
      } catch (error) {
        console.error(`HN keyword ${keyword} error:`, error);
      }
    }

    // Deduplicate by URL
    const uniqueContent = Array.from(
      new Map(viralContent.map((c) => [c.url, c])).values()
    );

    return uniqueContent;
  } catch (error) {
    console.error("HackerNews search error:", error);
    return [];
  }
}

/**
 * Analyze content using AI to extract viral elements
 */
export async function analyzeContent(
  url: string,
  title: string,
  content: string
): Promise<{ whyViral: string; contentIdeas: string[] }> {
  try {
    const model = await getAIModel();

    const prompt = `You are a viral content expert analyzing why a piece of content performed well.

Title: ${title}
Content Preview: ${content.substring(0, 1000) || "Link post - no text content"}
URL: ${url}

Analyze this content and provide:

1. WHY IT WENT VIRAL (2-3 sentences):
   - What hook/opening grabbed attention?
   - What emotional trigger did it hit? (curiosity, controversy, utility, relatability)
   - What content structure made it work? (story, how-to, data-driven, contrarian)
   - Timing/context factors if relevant

2. ACTIONABLE TAKEAWAYS (3-5 specific ideas):
   - Concrete content ideas inspired by this
   - Specific hooks/angles to replicate
   - Content formats that would work similarly
   - Target audience insights

Respond in JSON format:
{
  "whyViral": "Concise explanation of viral elements...",
  "contentIdeas": [
    "Specific content idea 1",
    "Specific content idea 2",
    "Specific content idea 3",
    "Specific content idea 4",
    "Specific content idea 5"
  ]
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
        whyViral: parsed.whyViral || "High engagement and discussion.",
        contentIdeas: parsed.contentIdeas || [],
      };
    }

    // Fallback
    return {
      whyViral:
        "Strong hook, clear value proposition, and resonated with target audience.",
      contentIdeas: [
        "Create similar content targeting the same pain point",
        "Use a similar content structure and format",
        "Replicate the emotional appeal and tone",
      ],
    };
  } catch (error) {
    console.error("Content analysis error:", error);
    return {
      whyViral:
        "Generated strong engagement through valuable insights and clear presentation.",
      contentIdeas: [
        "Analyze the content format and replicate it",
        "Target the same audience with a fresh angle",
        "Create a response or extension to this topic",
      ],
    };
  }
}

/**
 * Quick search for viral content with smart industry mapping
 */
export async function quickSearchViral(
  searchQuery: string,
  minEngagement: number = 50
): Promise<ViralContent[]> {
  const viralContent: ViralContent[] = [];

  try {
    // Search Reddit with query
    const redditResults = await searchReddit(searchQuery, {
      sort: "top",
      time: "month",
      limit: 20,
    });

    for (const post of redditResults.posts) {
      const engagementScore = post.score + post.num_comments * 2;
      if (engagementScore >= minEngagement && post.num_comments >= 10) {
        // Skip if no URL
        if (!post.url) continue;

        const analysis = await analyzeContent(
          post.url,
          post.title,
          post.selftext
        );

        viralContent.push({
          platform: "reddit",
          url: post.url,
          title: post.title,
          content: post.selftext.substring(0, 500),
          author: post.author,
          engagementScore,
          whyViral: analysis.whyViral,
          contentIdeas: analysis.contentIdeas,
          metadata: {
            subreddit: post.subreddit,
            score: post.score,
            num_comments: post.num_comments,
          },
          detectedAt: new Date(),
        });
      }
    }

    // Search HN with query
    const hnResults = await searchHackerNews(searchQuery, {
      tags: "story",
      numericFilters: `points>${minEngagement},num_comments>10`,
      hitsPerPage: 15,
    });

    for (const story of hnResults.hits) {
      const engagementScore = story.points + story.num_comments * 3;

      // Skip if no URL
      if (!story.url) continue;

      const analysis = await analyzeContent(
        story.url,
        story.title,
        story.story_text || ""
      );

      viralContent.push({
        platform: "hackernews",
        url: story.url,
        title: story.title,
        content: (story.story_text || "").substring(0, 500),
        author: story.author,
        engagementScore,
        whyViral: analysis.whyViral,
        contentIdeas: analysis.contentIdeas,
        metadata: {
          points: story.points,
          num_comments: story.num_comments,
        },
        detectedAt: new Date(),
      });
    }

    return viralContent.sort((a, b) => b.engagementScore - a.engagementScore);
  } catch (error) {
    console.error("Quick search error:", error);
    throw new Error(
      `Failed to search viral content: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
