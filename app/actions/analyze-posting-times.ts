"use server";

import { searchReddit, getSubredditPosts } from "@/lib/scraper/reddit-api";
import { searchHackerNews } from "@/lib/scraper/hackernews-api";
import { generateText } from "ai";
import { createLanguageModel } from "@/lib/ai/provider-factory";
import { getDefaultAIConfig } from "@/lib/ai/config";

export interface BestTimeAnalysis {
  platform: string;
  bestHours: number[]; // Hours of day (0-23)
  bestDays: string[]; // Days of week
  avgEngagement: number;
  confidence: 'low' | 'medium' | 'high';
  heatmapData: {
    day: string;
    hour: number;
    engagement: number;
  }[];
  insights: string[];
  sampleSize: number;
}

export interface PostingSchedule {
  timezone: string;
  slots: {
    day: string;
    time: string; // HH:MM format
    dayOfWeek: string;
    expectedEngagement: number;
  }[];
}

interface BestTimesFilters {
  platform: string;
  contentType: string;
  targetAudience: string;
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
 * Analyze best posting times based on historical engagement data
 */
export async function analyzeBestTimes(
  filters: BestTimesFilters
): Promise<BestTimeAnalysis> {
  const { platform, contentType, targetAudience } = filters;

  try {
    // Gather historical data from last 30 days
    const historicalData = await gatherHistoricalData(platform, contentType, targetAudience);

    // Calculate engagement patterns by time
    const patterns = calculateTimePatterns(historicalData);

    // Use AI to find insights
    const insights = await generateInsights(patterns, contentType, targetAudience);

    // Determine confidence based on sample size
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (historicalData.length > 100) confidence = 'high';
    else if (historicalData.length > 30) confidence = 'medium';

    return {
      platform,
      bestHours: patterns.topHours,
      bestDays: patterns.topDays,
      avgEngagement: patterns.avgEngagement,
      confidence,
      heatmapData: patterns.heatmapData,
      insights,
      sampleSize: historicalData.length,
    };
  } catch (error) {
    console.error("Best times analysis error:", error);
    throw new Error(
      `Failed to analyze posting times: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Gather historical posting data from platform
 */
async function gatherHistoricalData(
  platform: string,
  contentType: string,
  targetAudience: string
) {
  const posts: Array<{
    timestamp: number;
    engagement: number;
    hour: number;
    dayOfWeek: number;
  }> = [];

  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 2592000;

  try {
    if (platform.toLowerCase() === "reddit") {
      // Map content type to subreddits
      const subreddits = mapAudienceToSubreddits(targetAudience);

      for (const subreddit of subreddits.slice(0, 3)) {
        try {
          // Get posts from multiple time periods
          const [hotPosts, topPosts] = await Promise.all([
            getSubredditPosts(subreddit, "hot", 50),
            getSubredditPosts(subreddit, "top", 50),
          ]);

          const allPosts = [...hotPosts, ...topPosts];

          // Filter by timeframe
          const recentPosts = allPosts.filter((p) => p.created_utc >= thirtyDaysAgo);

          for (const post of recentPosts) {
            const date = new Date(post.created_utc * 1000);
            posts.push({
              timestamp: post.created_utc,
              engagement: post.score + post.num_comments * 2,
              hour: date.getUTCHours(),
              dayOfWeek: date.getUTCDay(),
            });
          }
        } catch (error) {
          console.error(`Subreddit ${subreddit} error:`, error);
        }
      }
    } else if (platform.toLowerCase() === "hackernews") {
      // Search for relevant keywords
      const keywords = extractKeywords(contentType, targetAudience);

      for (const keyword of keywords.slice(0, 2)) {
        try {
          const result = await searchHackerNews(keyword, {
            tags: "story",
            numericFilters: `created_at_i>${thirtyDaysAgo}`,
            hitsPerPage: 100,
          });

          for (const story of result.hits) {
            const date = new Date(story.created_at_i * 1000);
            posts.push({
              timestamp: story.created_at_i,
              engagement: story.points + story.num_comments * 3,
              hour: date.getUTCHours(),
              dayOfWeek: date.getUTCDay(),
            });
          }
        } catch (error) {
          console.error(`HN keyword ${keyword} error:`, error);
        }
      }
    }

    return posts;
  } catch (error) {
    console.error("Historical data gathering error:", error);
    return posts;
  }
}

/**
 * Map target audience to relevant subreddits
 */
function mapAudienceToSubreddits(audience: string): string[] {
  const audienceMap: Record<string, string[]> = {
    "b2b founders": ["startups", "Entrepreneur", "SaaS", "smallbusiness"],
    "college students": ["college", "studentlife", "GetStudying", "ApplyingToCollege"],
    "developers": ["programming", "webdev", "learnprogramming", "javascript"],
    "marketers": ["marketing", "digitalnomad", "growthhacking", "socialmedia"],
    "designers": ["design", "web_design", "userexperience", "graphic_design"],
    "entrepreneurs": ["Entrepreneur", "startups", "smallbusiness", "business"],
  };

  const lowerAudience = audience.toLowerCase();
  for (const [key, subreddits] of Object.entries(audienceMap)) {
    if (lowerAudience.includes(key)) {
      return subreddits;
    }
  }

  // Default fallback
  return ["business", "technology", "Entrepreneur"];
}

/**
 * Extract keywords from content type and audience
 */
function extractKeywords(contentType: string, audience: string): string[] {
  const keywords: string[] = [];

  // Add content type keywords
  if (contentType.toLowerCase().includes("question")) {
    keywords.push("Ask", "how to", "question");
  } else if (contentType.toLowerCase().includes("story")) {
    keywords.push("story", "experience", "journey");
  } else if (contentType.toLowerCase().includes("how-to")) {
    keywords.push("guide", "tutorial", "how to");
  } else if (contentType.toLowerCase().includes("announcement")) {
    keywords.push("launch", "release", "announcement");
  }

  // Add audience keywords
  const audienceWords = audience.toLowerCase().split(" ");
  keywords.push(...audienceWords.slice(0, 2));

  return keywords.length > 0 ? keywords : ["startup", "business"];
}

/**
 * Calculate engagement patterns by time
 */
function calculateTimePatterns(
  posts: Array<{
    timestamp: number;
    engagement: number;
    hour: number;
    dayOfWeek: number;
  }>
) {
  // Initialize engagement tracking
  const hourEngagement: Record<number, { total: number; count: number }> = {};
  const dayEngagement: Record<number, { total: number; count: number }> = {};
  const heatmapData: Record<string, Record<number, { total: number; count: number }>> = {};

  // Days of week
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Aggregate data
  for (const post of posts) {
    // Hour tracking
    if (!hourEngagement[post.hour]) {
      hourEngagement[post.hour] = { total: 0, count: 0 };
    }
    hourEngagement[post.hour].total += post.engagement;
    hourEngagement[post.hour].count += 1;

    // Day tracking
    if (!dayEngagement[post.dayOfWeek]) {
      dayEngagement[post.dayOfWeek] = { total: 0, count: 0 };
    }
    dayEngagement[post.dayOfWeek].total += post.engagement;
    dayEngagement[post.dayOfWeek].count += 1;

    // Heatmap data (day + hour)
    const dayName = dayNames[post.dayOfWeek];
    if (!heatmapData[dayName]) {
      heatmapData[dayName] = {};
    }
    if (!heatmapData[dayName][post.hour]) {
      heatmapData[dayName][post.hour] = { total: 0, count: 0 };
    }
    heatmapData[dayName][post.hour].total += post.engagement;
    heatmapData[dayName][post.hour].count += 1;
  }

  // Calculate averages
  const hourAverages = Object.entries(hourEngagement).map(([hour, data]) => ({
    hour: parseInt(hour),
    avg: data.total / data.count,
  }));

  const dayAverages = Object.entries(dayEngagement).map(([day, data]) => ({
    day: parseInt(day),
    avg: data.total / data.count,
  }));

  // Sort and get top performers
  hourAverages.sort((a, b) => b.avg - a.avg);
  dayAverages.sort((a, b) => b.avg - a.avg);

  const topHours = hourAverages.slice(0, 5).map((h) => h.hour);
  const topDays = dayAverages.slice(0, 3).map((d) => dayNames[d.day]);

  // Calculate overall average
  const totalEngagement = posts.reduce((sum, p) => sum + p.engagement, 0);
  const avgEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;

  // Format heatmap data
  const formattedHeatmap: {
    day: string;
    hour: number;
    engagement: number;
  }[] = [];

  for (const [day, hours] of Object.entries(heatmapData)) {
    for (const [hour, data] of Object.entries(hours)) {
      formattedHeatmap.push({
        day,
        hour: parseInt(hour),
        engagement: Math.round(data.total / data.count),
      });
    }
  }

  return {
    topHours,
    topDays,
    avgEngagement: Math.round(avgEngagement),
    heatmapData: formattedHeatmap,
  };
}

/**
 * Generate insights using AI
 */
async function generateInsights(
  patterns: {
    topHours: number[];
    topDays: string[];
    avgEngagement: number;
  },
  contentType: string,
  targetAudience: string
): Promise<string[]> {
  try {
    const model = await getAIModel();

    const prompt = `You are a social media strategist analyzing optimal posting times.

Content Type: ${contentType}
Target Audience: ${targetAudience}
Best Hours (UTC): ${patterns.topHours.join(', ')}
Best Days: ${patterns.topDays.join(', ')}
Average Engagement: ${patterns.avgEngagement}

Explain WHY these times work best for this audience and content type. Provide 4-5 specific insights.

Consider:
- Audience work/life patterns
- Time zones where audience is located
- Content consumption habits
- Competition levels at different times
- Content type best practices

Respond in JSON format:
{
  "insights": [
    "Specific insight 1 about why these times work",
    "Specific insight 2 about audience patterns",
    "Specific insight 3 about competition",
    "Specific insight 4 about content type timing",
    "Specific insight 5 about optimization tips"
  ]
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.insights || [];
    }

    return getFallbackInsights(patterns, contentType, targetAudience);
  } catch (error) {
    console.error("Insights generation error:", error);
    return getFallbackInsights(patterns, contentType, targetAudience);
  }
}

/**
 * Get fallback insights without AI
 */
function getFallbackInsights(
  patterns: {
    topHours: number[];
    topDays: string[];
    avgEngagement: number;
  },
  contentType: string,
  targetAudience: string
): string[] {
  const insights: string[] = [];

  // Time-based insights
  const hasMorning = patterns.topHours.some((h) => h >= 6 && h <= 11);
  const hasEvening = patterns.topHours.some((h) => h >= 17 && h <= 22);

  if (hasMorning) {
    insights.push(
      `Morning hours (${patterns.topHours.filter((h) => h >= 6 && h <= 11).join(', ')}:00 UTC) show high engagement - your audience is likely checking content during their commute or morning routine.`
    );
  }

  if (hasEvening) {
    insights.push(
      `Evening hours (${patterns.topHours.filter((h) => h >= 17 && h <= 22).join(', ')}:00 UTC) are optimal - people have more time to engage with ${contentType.toLowerCase()} content after work.`
    );
  }

  // Day-based insights
  const hasWeekdays = patterns.topDays.some((d) =>
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(d)
  );
  const hasWeekends = patterns.topDays.some((d) =>
    ["Saturday", "Sunday"].includes(d)
  );

  if (hasWeekdays && !hasWeekends) {
    insights.push(
      `Weekdays (${patterns.topDays.join(', ')}) perform best - your target audience (${targetAudience}) is more active during work days.`
    );
  } else if (hasWeekends) {
    insights.push(
      `Weekends show strong performance - your audience has more leisure time to engage deeply with content.`
    );
  }

  // Content type insight
  insights.push(
    `For ${contentType} content, consistency is key. Post regularly at these optimal times to build audience expectations.`
  );

  // Audience insight
  insights.push(
    `Your target audience (${targetAudience}) shows an average engagement of ${patterns.avgEngagement} per post at optimal times.`
  );

  return insights.slice(0, 5);
}

/**
 * Generate optimal posting schedule
 */
export async function generatePostingSchedule(
  timezone: string,
  postsPerWeek: number,
  analysis: BestTimeAnalysis
): Promise<PostingSchedule> {
  const slots: PostingSchedule['slots'] = [];

  try {
    // Convert best times to the user's timezone
    const bestHours = analysis.bestHours.slice(0, 5);
    const bestDays = analysis.bestDays;

    // Calculate posts per day
    const postsPerDay = Math.ceil(postsPerWeek / 7);

    // Generate schedule
    let postCount = 0;
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let dayIdx = 0; dayIdx < 7 && postCount < postsPerWeek; dayIdx++) {
      const dayName = dayNames[dayIdx];

      // Prioritize best days
      const isDayOptimal = bestDays.includes(dayName);

      if (isDayOptimal || postCount < postsPerWeek) {
        // Use best hour for this day
        const hourForDay = bestHours[postCount % bestHours.length];
        const time = `${hourForDay.toString().padStart(2, '0')}:00`;

        // Calculate expected engagement (higher for optimal days/times)
        const baseEngagement = analysis.avgEngagement;
        const multiplier = isDayOptimal ? 1.2 : 0.8;
        const expectedEngagement = Math.round(baseEngagement * multiplier);

        slots.push({
          day: dayName,
          time,
          dayOfWeek: dayName,
          expectedEngagement,
        });

        postCount++;

        // Add second post if postsPerDay > 1
        if (postsPerDay > 1 && postCount < postsPerWeek) {
          const secondHour = bestHours[(postCount % bestHours.length) + 1] || bestHours[0];
          const secondTime = `${secondHour.toString().padStart(2, '0')}:00`;

          slots.push({
            day: dayName,
            time: secondTime,
            dayOfWeek: dayName,
            expectedEngagement: Math.round(baseEngagement * 0.9),
          });

          postCount++;
        }
      }
    }

    return {
      timezone,
      slots: slots.slice(0, postsPerWeek),
    };
  } catch (error) {
    console.error("Schedule generation error:", error);
    throw new Error(
      `Failed to generate posting schedule: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
