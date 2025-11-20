"use server";

import { generateStructuredOutput } from "@/lib/ai/service";
import { getServerAIConfig } from "@/lib/ai/config";
import { z } from "zod";

/**
 * Social Platform Types
 */
export const SocialPlatform = {
  TWITTER: "twitter",
  LINKEDIN: "linkedin",
  INSTAGRAM: "instagram",
  TIKTOK: "tiktok",
} as const;

export type SocialPlatform = (typeof SocialPlatform)[keyof typeof SocialPlatform];

/**
 * Tone Options
 */
export const ToneType = {
  PROFESSIONAL: "professional",
  CASUAL: "casual",
  PLAYFUL: "playful",
  INSPIRATIONAL: "inspirational",
  EDUCATIONAL: "educational",
} as const;

export type ToneType = (typeof ToneType)[keyof typeof ToneType];

/**
 * Social Post Variation Schema
 */
const SocialPostVariationSchema = z.object({
  content: z.string(),
  hook: z.string().describe("The opening line/hook"),
  cta: z.string().describe("Call-to-action"),
  hashtags: z.array(z.string()).optional().describe("Relevant hashtags (Instagram/TikTok)"),
  optimalPostingTime: z.string().describe("Best time to post (e.g., 'Tuesday 10 AM', 'Weekend evening')"),
  characterCount: z.number(),
  variation: z.enum(["thread_starter", "single_post", "question_hook"]).optional(),
});

export type SocialPostVariation = z.infer<typeof SocialPostVariationSchema>;

/**
 * Social Post Generator Response Schema
 */
const SocialPostGeneratorSchema = z.object({
  platform: z.string(),
  variations: z.array(SocialPostVariationSchema).min(1),
});

export type SocialPostGeneratorResult = z.infer<typeof SocialPostGeneratorSchema>;

/**
 * Generates platform-specific social media posts
 */
export async function generateSocialPost(
  topic: string,
  platform: SocialPlatform,
  tone: ToneType
): Promise<SocialPostGeneratorResult> {
  if (!topic || !platform || !tone) {
    throw new Error("Topic, platform, and tone are required");
  }

  const aiConfig = getServerAIConfig();
  if (!aiConfig) {
    throw new Error("AI provider not configured. Please check your API keys in Settings.");
  }

  // Platform-specific requirements
  const platformSpecs = getPlatformSpecifications(platform);

  try {
    const systemPrompt = `You are a social media strategist specializing in viral content creation.

Your expertise spans:
- Platform-specific best practices and algorithms
- Engagement optimization (likes, comments, shares)
- Community building and audience retention
- Trend analysis and content timing
- Authentic, non-salesy messaging for Gen Z

PLATFORM EXPERTISE:
- **Twitter/X:** Threading, conversation starters, brevity, personality
- **LinkedIn:** Thought leadership, professional storytelling, value-first
- **Instagram:** Visual-first, story-driven captions, hashtag strategy
- **TikTok:** Hook in 3 seconds, fast-paced, trend-aware, entertainment

CRITICAL RULES:
- ALWAYS respect character limits strictly
- Adapt tone to platform culture
- Include strong hooks (first 3 seconds/words matter)
- End with clear, non-pushy CTAs
- For Instagram/TikTok: Include 15-20 relevant hashtags`;

    const userPrompt = `Generate ${platformSpecs.variationCount} social media post variations for ${platform.toUpperCase()}:

**Topic:** ${topic}
**Platform:** ${platform}
**Character Limit:** ${platformSpecs.characterLimit}
**Tone:** ${tone}
**Requirements:** ${platformSpecs.requirements}

${platformSpecs.variationTypes}

For each variation, provide:
- Full post content (respecting ${platformSpecs.characterLimit} character limit)
- The hook (opening line)
- Call-to-action
${platform === "instagram" || platform === "tiktok" ? "- 15-20 relevant hashtags" : ""}
- Optimal posting time
- Exact character count

Make the content specific, engaging, and authentic. Avoid generic corporate speak.`;

    const result = await generateStructuredOutput(
      {
        prompt: userPrompt,
        systemPrompt,
        schema: SocialPostGeneratorSchema,
        temperature: 0.8,
        maxTokens: 2000,
      },
      aiConfig
    );

    return result;
  } catch (error) {
    console.error("[generateSocialPost] Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate social posts"
    );
  }
}

/**
 * Generates multi-post content (threads/carousels)
 */
export async function generateThreadCarousel(
  topic: string,
  platform: SocialPlatform,
  slides: number
): Promise<{ posts: SocialPostVariation[] }> {
  if (!topic || !platform || !slides || slides < 2 || slides > 10) {
    throw new Error("Topic, platform, and slides (2-10) are required");
  }

  const aiConfig = getServerAIConfig();
  if (!aiConfig) {
    throw new Error("AI provider not configured. Please check your API keys in Settings.");
  }

  const ThreadCarouselSchema = z.object({
    posts: z.array(SocialPostVariationSchema).length(slides),
  });

  try {
    const systemPrompt = `You are a social media strategist specializing in multi-post content (threads, carousels).

Your expertise:
- Creating narrative arcs across multiple posts
- Hook → Value → Payoff structure
- Maintaining engagement across the sequence
- Clear progression and coherent storytelling
- Strong closing CTAs

BEST PRACTICES:
**Twitter Threads:**
- Post 1: Hook that promises value
- Posts 2-N-1: Deliver on the promise with actionable insights
- Post N: Summary + CTA + "Please RT if you found this valuable"

**LinkedIn Carousels:**
- Slide 1: Eye-catching title + promise
- Slides 2-N-1: One insight per slide, visual-friendly text
- Slide N: Recap + CTA + profile follow

**Instagram Carousels:**
- Slide 1: Visual hook + teaser
- Slides 2-N-1: Story progression, one point per slide
- Slide N: Resolution + CTA + swipe encouragement`;

    const userPrompt = `Generate a ${slides}-post ${getContentType(platform)} for ${platform.toUpperCase()}:

**Topic:** ${topic}
**Platform:** ${platform}
**Number of Posts/Slides:** ${slides}
**Content Type:** ${getContentType(platform)}

Create a cohesive narrative that:
1. Hooks the audience immediately (Post/Slide 1)
2. Delivers value progressively (Posts/Slides 2-${slides - 1})
3. Ends with a strong CTA (Post/Slide ${slides})

Each post/slide should:
- Stand alone but connect to the overall narrative
- Respect platform character limits
- Include optimal posting time (for threads, post all at once)
- Be numbered/sequenced clearly`;

    const result = await generateStructuredOutput(
      {
        prompt: userPrompt,
        systemPrompt,
        schema: ThreadCarouselSchema,
        temperature: 0.8,
        maxTokens: 3000,
      },
      aiConfig
    );

    return result;
  } catch (error) {
    console.error("[generateThreadCarousel] Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate thread/carousel"
    );
  }
}

/**
 * Gets platform-specific specifications
 */
function getPlatformSpecifications(platform: SocialPlatform) {
  switch (platform) {
    case SocialPlatform.TWITTER:
      return {
        characterLimit: 280,
        variationCount: 3,
        requirements: "Concise, conversational, personality-driven",
        variationTypes: `Generate 3 variations:
1. Thread starter (teaser that encourages clicking "Show more")
2. Single standalone tweet
3. Question hook (engages audience to reply)`,
      };
    case SocialPlatform.LINKEDIN:
      return {
        characterLimit: 1300,
        variationCount: 2,
        requirements: "Professional tone, thought leadership, value-first",
        variationTypes: `Generate 2 variations:
1. Story-driven post (personal anecdote → insight)
2. List/framework post (structured, scannable)`,
      };
    case SocialPlatform.INSTAGRAM:
      return {
        characterLimit: 2200,
        variationCount: 2,
        requirements: "Visual-first captions, story-driven, hashtag-rich",
        variationTypes: `Generate 2 variations:
1. Storytelling caption (narrative with emotional arc)
2. Value-driven caption (tips/insights in caption)
Include 15-20 hashtags for both.`,
      };
    case SocialPlatform.TIKTOK:
      return {
        characterLimit: 2200,
        variationCount: 3,
        requirements: "Hook in first 3 seconds, fast-paced, entertainment-focused",
        variationTypes: `Generate 3 script variations:
1. Pattern interrupt hook ("Stop scrolling if...")
2. POV/relatable scenario
3. Trend-based format
Include 15-20 hashtags for all.`,
      };
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Gets content type name for multi-post content
 */
function getContentType(platform: SocialPlatform): string {
  switch (platform) {
    case SocialPlatform.TWITTER:
      return "thread";
    case SocialPlatform.LINKEDIN:
    case SocialPlatform.INSTAGRAM:
      return "carousel";
    case SocialPlatform.TIKTOK:
      return "series";
    default:
      return "sequence";
  }
}
