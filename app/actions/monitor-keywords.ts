"use server";

import { searchReddit } from "@/lib/scraper/reddit-api";
import { searchHackerNews, searchRecentStories } from "@/lib/scraper/hackernews-api";
import { generateText } from "ai";
import { getAIModel } from "@/lib/ai/provider-factory";

interface KeywordMention {
  platform: string;
  url: string;
  title: string;
  content: string;
  author: string;
  engagementScore: number;
  relevanceScore: number;
  suggestedReply: string;
  metadata: Record<string, any>;
}

/**
 * Monitor a single keyword across all platforms
 * Returns new mentions with AI-scored relevance and suggested replies
 */
export async function monitorKeyword(
  keyword: string,
  userICP?: string
): Promise<KeywordMention[]> {
  const mentions: KeywordMention[]  = [];

  try {
    // Search Reddit
    const redditResults = await searchReddit(keyword, {
      sort: 'new',
      time: 'week',
      limit: 25,
    });

    for (const post of redditResults.posts) {
      // Only include posts with decent engagement
      if (post.score > 5 || post.num_comments > 2) {
        // Score relevance and generate reply using AI
        const { relevanceScore, suggestedReply } = await scoreAndReply(
          post.title,
          post.selftext,
          keyword,
          userICP
        );

        mentions.push({
          platform: 'reddit',
          url: post.url,
          title: post.title,
          content: post.selftext,
          author: post.author,
          engagementScore: post.score + (post.num_comments * 2),
          relevanceScore,
          suggestedReply,
          metadata: {
            subreddit: post.subreddit,
            score: post.score,
            num_comments: post.num_comments,
            created_utc: post.created_utc,
          },
        });
      }
    }

    // Search Hacker News
    const hnResults = await searchRecentStories(keyword, 10, 3);

    for (const story of hnResults) {
      const { relevanceScore, suggestedReply } = await scoreAndReply(
        story.title,
        story.story_text || '',
        keyword,
        userICP
      );

      mentions.push({
        platform: 'hackernews',
        url: story.url,
        title: story.title,
        content: story.story_text || '',
        author: story.author,
        engagementScore: story.points + (story.num_comments * 2),
        relevanceScore,
        suggestedReply,
        metadata: {
          points: story.points,
          num_comments: story.num_comments,
          created_at: story.created_at,
        },
      });
    }

    // Sort by relevance and engagement
    mentions.sort((a, b) => {
      const scoreA = a.relevanceScore * a.engagementScore;
      const scoreB = b.relevanceScore * b.engagementScore;
      return scoreB - scoreA;
    });

    return mentions;
  } catch (error) {
    console.error('Keyword monitoring error:', error);
    throw new Error(`Failed to monitor keyword: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Score relevance and generate reply suggestion using AI
 */
async function scoreAndReply(
  title: string,
  content: string,
  keyword: string,
  userICP?: string
): Promise<{ relevanceScore: number; suggestedReply: string }> {
  try {
    const model = await getAIModel();

    const prompt = `You are analyzing a social media post to determine if it's relevant to a company monitoring the keyword "${keyword}".

Post Title: ${title}
Post Content: ${content || '(no content)'}
${userICP ? `\nCompany's ICP: ${userICP}` : ''}

Task 1: Score relevance (0-100)
- 90-100: Perfect match, clear buying intent or pain point discussion
- 70-89: Highly relevant, discussing related topics
- 50-69: Somewhat relevant, tangentially related
- 30-49: Low relevance, keyword mentioned but off-topic
- 0-29: Not relevant, false positive

Task 2: Generate a helpful, non-promotional reply (2-3 sentences)
- Focus on providing value, not pitching
- Share relevant insights or ask clarifying questions
- Sound natural and conversational
- If relevance < 50, suggest "Skip - not relevant"

Respond in JSON format:
{
  "relevanceScore": number,
  "reasoning": "why this score",
  "suggestedReply": "your reply text or 'Skip - not relevant'"
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        relevanceScore: parsed.relevanceScore || 0,
        suggestedReply: parsed.suggestedReply || '',
      };
    }

    // Fallback if parsing fails
    return {
      relevanceScore: 50,
      suggestedReply: 'Review this thread manually.',
    };
  } catch (error) {
    console.error('AI scoring error:', error);
    return {
      relevanceScore: 50,
      suggestedReply: 'Error generating reply. Review manually.',
    };
  }
}

/**
 * Monitor all active keywords for a workspace
 * This would be called by a background job
 */
export async function monitorAllKeywords(
  workspaceId: string,
  keywords: string[],
  userICP?: string
): Promise<{
  totalMentions: number;
  highPriorityCount: number;
  mentions: KeywordMention[];
}> {
  const allMentions: KeywordMention[] = [];

  for (const keyword of keywords) {
    const mentions = await monitorKeyword(keyword, userICP);
    allMentions.push(...mentions);
  }

  // Deduplicate by URL
  const uniqueMentions = Array.from(
    new Map(allMentions.map(m => [m.url, m])).values()
  );

  // Count high priority (relevance > 70, engagement > 50)
  const highPriority = uniqueMentions.filter(
    m => m.relevanceScore > 70 && m.engagementScore > 50
  );

  return {
    totalMentions: uniqueMentions.length,
    highPriorityCount: highPriority.length,
    mentions: uniqueMentions,
  };
}
