"use server";

import { generateStructuredOutput } from "@/lib/ai/service";
import { getServerAIConfig } from "@/lib/ai/config";
import { z } from "zod";

/**
 * Content Type for Hooks
 */
export const ContentType = {
  SOCIAL_POST: "social_post",
  BLOG: "blog",
  VIDEO: "video",
  EMAIL: "email",
  PRESENTATION: "presentation",
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

/**
 * Hook Category Types
 */
export const HookCategory = {
  QUESTION: "question",
  STATEMENT: "statement",
  STORY: "story",
} as const;

export type HookCategory = (typeof HookCategory)[keyof typeof HookCategory];

/**
 * Emotional Trigger Types
 */
export const EmotionalTrigger = {
  CURIOSITY: "curiosity",
  FEAR: "fear",
  DESIRE: "desire",
  SURPRISE: "surprise",
  URGENCY: "urgency",
  BELONGING: "belonging",
  VALIDATION: "validation",
} as const;

export type EmotionalTrigger = (typeof EmotionalTrigger)[keyof typeof EmotionalTrigger];

/**
 * Hook Variation Schema
 */
const HookVariationSchema = z.object({
  hook: z.string(),
  category: z.enum(["question", "statement", "story"]),
  emotionalTrigger: z.enum([
    "curiosity",
    "fear",
    "desire",
    "surprise",
    "urgency",
    "belonging",
    "validation",
  ]),
  strengthScore: z.number().min(0).max(100).describe("Hook effectiveness score"),
  explanation: z.string().describe("Why this hook works"),
});

export type HookVariation = z.infer<typeof HookVariationSchema>;

/**
 * Hook Generator Response Schema
 */
const HookGeneratorSchema = z.object({
  hooks: z.array(HookVariationSchema).length(15),
});

export type HookGeneratorResult = z.infer<typeof HookGeneratorSchema>;

/**
 * Hook Analysis Schema
 */
const HookAnalysisSchema = z.object({
  strengthScore: z.number().min(0).max(100),
  emotionalTrigger: z.enum([
    "curiosity",
    "fear",
    "desire",
    "surprise",
    "urgency",
    "belonging",
    "validation",
  ]),
  improvementSuggestions: z.array(z.string()),
  reasoning: z.string(),
  improvedVersion: z.string().optional(),
});

export type HookAnalysis = z.infer<typeof HookAnalysisSchema>;

/**
 * Generates 15 hook variations across different categories
 */
export async function generateHooks(
  topic: string,
  contentType: ContentType,
  targetAudience: string
): Promise<HookGeneratorResult> {
  if (!topic || !contentType || !targetAudience) {
    throw new Error("Topic, content type, and target audience are required");
  }

  const aiConfig = getServerAIConfig();
  if (!aiConfig) {
    throw new Error("AI provider not configured. Please check your API keys in Settings.");
  }

  const contentSpecs = getContentTypeSpecifications(contentType);

  try {
    const systemPrompt = `You are a master copywriter specializing in attention-grabbing hooks.

Your expertise includes:
- Consumer psychology and emotional triggers
- Pattern interrupts and curiosity gaps
- Story structure and narrative hooks
- Platform-specific engagement tactics
- A/B testing and data-driven optimization

HOOK PSYCHOLOGY:
**The 7 Emotional Triggers:**
1. **Curiosity:** Information gap, mystery, "what happens next?"
2. **Fear:** Loss aversion, risk awareness, consequences
3. **Desire:** Aspiration, achievement, transformation
4. **Surprise:** Unexpected twist, counterintuitive insight
5. **Urgency:** FOMO, time sensitivity, scarcity
6. **Belonging:** Community, identity, "people like you"
7. **Validation:** Recognition, status, achievement

HOOK FORMULAS:

**Question Hooks:**
- "What if [bold claim]?"
- "Why do [group] always [action]?"
- "Have you ever wondered [mystery]?"
- "What's the secret to [desired outcome]?"
- "How did [person/company] achieve [result]?"

**Statement Hooks:**
- "Most people don't know [counterintuitive fact]."
- "The truth about [topic] that nobody talks about."
- "[Number] [thing] that changed how I [action]."
- "Stop doing [common action]. Here's why."
- "This is why [controversial opinion]."

**Story Hooks:**
- "I once made the mistake of [relatable error]..."
- "Two years ago, I was [undesirable state]. Today, [desired state]."
- "The moment I realized [insight] changed everything."
- "Nobody tells you about [truth] when you start [journey]."
- "Here's what happened when I [bold action]..."

CONTENT-SPECIFIC OPTIMIZATION:
${contentSpecs.hookGuidelines}`;

    const userPrompt = `Generate 15 powerful hooks for the following content:

**Topic:** ${topic}
**Content Type:** ${contentType}
**Target Audience:** ${targetAudience}
**Content Context:** ${contentSpecs.context}

Create exactly 15 hooks distributed as:
- 5 question hooks (curiosity, desire, surprise)
- 5 statement hooks (fear, urgency, validation)
- 5 story hooks (belonging, transformation, relatability)

For each hook:
1. Write the hook (optimized for ${contentType})
2. Identify the category (question/statement/story)
3. Identify the primary emotional trigger
4. Assign a strength score (0-100)
5. Explain why this hook works for ${targetAudience}

Make hooks specific to the topic and audience, not generic templates.`;

    const result = await generateStructuredOutput(
      {
        prompt: userPrompt,
        systemPrompt,
        schema: HookGeneratorSchema,
        temperature: 0.8,
        maxTokens: 3500,
      },
      aiConfig
    );

    return result;
  } catch (error) {
    console.error("[generateHooks] Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate hooks"
    );
  }
}

/**
 * Analyzes a hook and provides improvement suggestions
 */
export async function analyzeHook(hook: string): Promise<HookAnalysis> {
  if (!hook) {
    throw new Error("Hook is required");
  }

  const aiConfig = getServerAIConfig();
  if (!aiConfig) {
    throw new Error("AI provider not configured. Please check your API keys in Settings.");
  }

  try {
    const systemPrompt = `You are a copywriting analyst specializing in hook optimization.

Your evaluation criteria:
1. **Clarity:** Is the hook immediately understandable?
2. **Specificity:** Does it avoid vague generalities?
3. **Emotional Resonance:** Does it trigger curiosity, fear, desire, etc.?
4. **Promise:** Does it hint at valuable information?
5. **Brevity:** Is it concise and punchy?
6. **Target Relevance:** Does it speak to a specific audience?

SCORING RUBRIC (0-100):
- **90-100:** World-class hook, could go viral
- **75-89:** Strong hook, likely to perform well
- **60-74:** Good hook, minor improvements needed
- **40-59:** Mediocre hook, significant improvements required
- **0-39:** Weak hook, needs complete rewrite

IMPROVEMENT SUGGESTIONS:
- Add specificity (numbers, names, details)
- Strengthen emotional trigger
- Create bigger curiosity gap
- Remove filler words
- Make it more conversational
- Add a pattern interrupt
- Increase relevance to target audience`;

    const userPrompt = `Analyze this hook and provide detailed feedback:

"${hook}"

Evaluate:
1. Strength score (0-100)
2. Primary emotional trigger
3. 3-5 specific improvement suggestions
4. Reasoning for your assessment
5. An improved version of the hook (if score < 75)

Be honest and specific. Provide actionable feedback.`;

    const result = await generateStructuredOutput(
      {
        prompt: userPrompt,
        systemPrompt,
        schema: HookAnalysisSchema,
        temperature: 0.4,
        maxTokens: 800,
      },
      aiConfig
    );

    return result;
  } catch (error) {
    console.error("[analyzeHook] Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to analyze hook"
    );
  }
}

/**
 * Gets content type specifications
 */
function getContentTypeSpecifications(contentType: ContentType) {
  switch (contentType) {
    case ContentType.SOCIAL_POST:
      return {
        context: "Short-form social media content (Twitter, LinkedIn, Instagram)",
        hookGuidelines: `**Social Post Hooks:**
- First 10 words determine if they keep reading
- Must stop the scroll (pattern interrupt)
- Platform-specific: LinkedIn (professional), Twitter (conversational), Instagram (visual)
- Length: 1-2 sentences max
- Examples:
  - "I got fired. Best thing that ever happened."
  - "Everyone says to work hard. That's terrible advice."
  - "What if I told you [bold claim]?"`,
      };
    case ContentType.BLOG:
      return {
        context: "Long-form blog posts and articles",
        hookGuidelines: `**Blog Hooks:**
- Headline + opening paragraph work together
- Promise value immediately (no throat-clearing)
- Set up the problem before the solution
- Length: 1-3 sentences
- Examples:
  - "Most productivity advice is wrong. Here's what actually works."
  - "I spent $10K on courses. Here are the 3 lessons worth remembering."
  - "You're leaving money on the table. Let me show you where."`,
      };
    case ContentType.VIDEO:
      return {
        context: "Video content (YouTube, TikTok, Reels)",
        hookGuidelines: `**Video Hooks:**
- First 3 seconds are CRITICAL (before they swipe)
- Visual + verbal hook combined
- Tease the payoff immediately
- Use pattern interrupts
- Length: 5-10 seconds
- Examples:
  - "Stop! Before you [common action], watch this."
  - "This [thing] changed everything. Here's how."
  - "I tried [thing] for 30 days. The results shocked me."`,
      };
    case ContentType.EMAIL:
      return {
        context: "Email marketing and newsletters",
        hookGuidelines: `**Email Hooks:**
- Subject line + preview text = the hook
- Promise specific value
- Avoid spam triggers
- Length: Subject line (7-10 words) + opening line
- Examples:
  - Subject: "The [topic] mistake costing you [specific loss]"
  - Subject: "[Name], this might surprise you..."
  - Subject: "3 things I learned from [authority/experience]"`,
      };
    case ContentType.PRESENTATION:
      return {
        context: "Presentations, pitches, and talks",
        hookGuidelines: `**Presentation Hooks:**
- Opening slide + first 30 seconds
- Grab attention before content
- Use data, story, or question
- Set expectations
- Examples:
  - "By the end of this, you'll know exactly how to [outcome]."
  - "Raise your hand if you've ever [relatable problem]."
  - "[Shocking statistic]. That's why we're here today."`,
      };
    default:
      return {
        context: "General content",
        hookGuidelines: "Create attention-grabbing, specific, emotionally resonant hooks.",
      };
  }
}
