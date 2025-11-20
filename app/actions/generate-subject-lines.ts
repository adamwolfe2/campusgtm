"use server";

import { generateStructuredOutput } from "@/lib/ai/service";
import { getServerAIConfig } from "@/lib/ai/config";
import { z } from "zod";

/**
 * Email Subject Line Performance Prediction Schema
 */
const SubjectLinePerformanceSchema = z.object({
  estimatedOpenRate: z.number().min(0).max(100).describe("Estimated open rate percentage"),
  spamRisk: z.enum(["low", "medium", "high"]).describe("Spam filter risk level"),
  emotionalAppeal: z.number().min(0).max(100).describe("Emotional appeal score"),
  bestSendTime: z.enum(["morning", "afternoon", "evening"]).describe("Optimal send time"),
  reasoning: z.string().describe("Brief explanation of the prediction"),
});

export type SubjectLinePerformance = z.infer<typeof SubjectLinePerformanceSchema>;

/**
 * Subject Line Variation Schema
 */
const SubjectLineVariationSchema = z.object({
  subjectLine: z.string(),
  category: z.enum([
    "curiosity-driven",
    "value-driven",
    "urgency-driven",
    "personalization-driven",
  ]),
  performance: SubjectLinePerformanceSchema,
});

export type SubjectLineVariation = z.infer<typeof SubjectLineVariationSchema>;

/**
 * Subject Line Optimizer Response Schema
 */
const SubjectLineOptimizerSchema = z.object({
  variations: z.array(SubjectLineVariationSchema).length(10),
});

export type SubjectLineOptimizerResult = z.infer<typeof SubjectLineOptimizerSchema>;

/**
 * Optimizes email subject lines by generating 10 variations across different categories
 */
export async function optimizeSubjectLine(
  topic: string,
  audience: string,
  goal: string
): Promise<SubjectLineOptimizerResult> {
  if (!topic || !audience || !goal) {
    throw new Error("Topic, audience, and goal are required");
  }

  const aiConfig = getServerAIConfig();
  if (!aiConfig) {
    throw new Error("AI provider not configured. Please check your API keys in Settings.");
  }

  try {
    const systemPrompt = `You are an expert email marketing strategist specializing in subject line optimization.

Your expertise includes:
- Understanding email deliverability and spam filters
- Crafting compelling hooks that drive opens
- A/B testing best practices
- Platform-specific optimization (Gmail, Outlook, mobile)
- Psychology of curiosity, urgency, and value

CRITICAL GUIDELINES:
- Keep subject lines under 60 characters (mobile truncation)
- Avoid spam trigger words (FREE, URGENT, !!!, $$$)
- Use power words that evoke emotion
- Personalization increases open rates by 26%
- Test different tones: casual, professional, playful
- Numbers and specifics perform better than vague claims`;

    const userPrompt = `Generate 10 email subject line variations for the following campaign:

**Topic:** ${topic}
**Target Audience:** ${audience}
**Campaign Goal:** ${goal}

Create exactly 10 variations distributed as follows:
- 3 curiosity-driven (e.g., "This [X] will change how you...")
- 3 value-driven (e.g., "[Number] ways to...")
- 2 urgency-driven (e.g., "Last chance to...")
- 2 personalization-driven (e.g., "For [audience] only...")

For each subject line, predict its performance:
- Estimated open rate (0-100%)
- Spam risk (low/medium/high)
- Emotional appeal score (0-100)
- Best send time (morning/afternoon/evening)
- Brief reasoning for the prediction

Make subject lines specific to the topic and audience, not generic templates.`;

    const result = await generateStructuredOutput(
      {
        prompt: userPrompt,
        systemPrompt,
        schema: SubjectLineOptimizerSchema,
        temperature: 0.8,
      },
      aiConfig
    );

    return result;
  } catch (error) {
    console.error("[optimizeSubjectLine] Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate subject lines"
    );
  }
}

/**
 * Predicts performance of a single subject line
 */
export async function predictPerformance(
  subjectLine: string
): Promise<SubjectLinePerformance> {
  if (!subjectLine) {
    throw new Error("Subject line is required");
  }

  const aiConfig = getServerAIConfig();
  if (!aiConfig) {
    throw new Error("AI provider not configured. Please check your API keys in Settings.");
  }

  try {
    const systemPrompt = `You are an AI email marketing analyst specializing in subject line performance prediction.

You analyze subject lines based on:
1. **Open Rate Factors:**
   - Length (optimal: 40-60 characters)
   - Personalization tokens
   - Emotional triggers
   - Use of numbers/specifics
   - Question vs statement

2. **Spam Risk Factors:**
   - Trigger words (FREE, URGENT, ACT NOW)
   - Excessive punctuation (!!!, ???)
   - All caps
   - Special characters ($$$, ...)
   - Misleading claims

3. **Emotional Appeal:**
   - Curiosity gap
   - Fear of missing out (FOMO)
   - Desire/aspiration
   - Pain point addressing
   - Social proof

4. **Send Time Optimization:**
   - Morning (7-10 AM): Professional, news, urgent
   - Afternoon (1-4 PM): Value, educational, casual
   - Evening (6-9 PM): Personal, entertainment, aspirational

Provide data-driven predictions with clear reasoning.`;

    const userPrompt = `Analyze this email subject line and predict its performance:

"${subjectLine}"

Provide:
1. Estimated open rate (0-100%)
2. Spam risk level (low/medium/high)
3. Emotional appeal score (0-100)
4. Best send time (morning/afternoon/evening)
5. Brief reasoning for these predictions`;

    const result = await generateStructuredOutput(
      {
        prompt: userPrompt,
        systemPrompt,
        schema: SubjectLinePerformanceSchema,
        temperature: 0.4,
      },
      aiConfig
    );

    return result;
  } catch (error) {
    console.error("[predictPerformance] Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to predict performance"
    );
  }
}
