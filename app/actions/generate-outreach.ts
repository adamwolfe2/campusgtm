"use server";

import { generateStructuredOutput } from "@/lib/ai/service";
import { getServerAIConfig } from "@/lib/ai/config";
import { z } from "zod";

/**
 * Outreach Platform Types
 */
export const OutreachPlatform = {
  LINKEDIN: "linkedin",
  INSTAGRAM: "instagram",
  TWITTER: "twitter",
  EMAIL: "email",
} as const;

export type OutreachPlatform = (typeof OutreachPlatform)[keyof typeof OutreachPlatform];

/**
 * Outreach Tone Types
 */
export const OutreachTone = {
  FRIENDLY: "friendly",
  PROFESSIONAL: "professional",
  CASUAL: "casual",
  AUTHORITATIVE: "authoritative",
} as const;

export type OutreachTone = (typeof OutreachTone)[keyof typeof OutreachTone];

/**
 * Cold Email Variation Schema
 */
const ColdEmailVariationSchema = z.object({
  subject: z.string().describe("Email subject line"),
  body: z.string().describe("Email body (150-200 words)"),
  personalizationTokens: z.array(z.string()).describe("Tokens like {{firstName}}, {{company}}"),
  variation: z.enum(["direct", "story-based", "question-based"]),
  wordCount: z.number(),
});

export type ColdEmailVariation = z.infer<typeof ColdEmailVariationSchema>;

/**
 * Cold Email Generator Response Schema
 */
const ColdEmailGeneratorSchema = z.object({
  variations: z.array(ColdEmailVariationSchema).length(3),
});

export type ColdEmailGeneratorResult = z.infer<typeof ColdEmailGeneratorSchema>;

/**
 * DM Script Schema
 */
const DMScriptSchema = z.object({
  platform: z.string(),
  script: z.string(),
  characterCount: z.number(),
  tone: z.string(),
  followUpMessage: z.string().optional().describe("Optional follow-up if no response"),
});

export type DMScript = z.infer<typeof DMScriptSchema>;

/**
 * Comment Reply Schema
 */
const CommentReplySchema = z.object({
  reply: z.string(),
  acknowledgment: z.string().describe("How it acknowledges the original comment"),
  value: z.string().describe("What value it adds"),
  cta: z.string().optional().describe("Optional soft sell CTA"),
  tone: z.string(),
});

export type CommentReply = z.infer<typeof CommentReplySchema>;

/**
 * Generates personalized cold email templates
 */
export async function generateColdEmail(
  recipientInfo: string,
  goal: string,
  companyContext: string,
  tone: OutreachTone = OutreachTone.FRIENDLY
): Promise<ColdEmailGeneratorResult> {
  if (!recipientInfo || !goal || !companyContext) {
    throw new Error("Recipient info, goal, and company context are required");
  }

  const aiConfig = getServerAIConfig();
  if (!aiConfig) {
    throw new Error("AI provider not configured. Please check your API keys in Settings.");
  }

  try {
    const systemPrompt = `You are a cold email copywriting expert specializing in B2B and campus outreach.

Your philosophy:
- PERSONALIZATION > PITCH: Research first, sell second
- BREVITY IS RESPECT: 150-200 words max
- VALUE FIRST: What's in it for them?
- NO SPAM LANGUAGE: Avoid "exciting opportunity," "reaching out," "just wanted to"
- HUMAN, NOT ROBOTIC: Write like you're messaging a friend

COLD EMAIL BEST PRACTICES:
1. **Subject Line:** Curiosity + relevance (7-10 words)
2. **Opening:** Specific observation about them (shows you did research)
3. **Body:** Their problem → Your solution → Proof/credibility
4. **CTA:** Single, clear ask (15-min call, quick question, feedback)
5. **Signature:** Professional but approachable

PERSONALIZATION TOKENS:
Use {{firstName}}, {{company}}, {{role}}, {{recentAchievement}} for mail merge.

TONE GUIDELINES:
- **Friendly:** Warm, conversational, "I noticed..."
- **Professional:** Respectful, data-driven, "I wanted to share..."
- **Casual:** Relaxed, Gen Z, "Hey [name]..."
- **Authoritative:** Expert positioning, "Based on our work with..."`;

    const userPrompt = `Generate 3 cold email variations for the following outreach:

**Recipient Information:** ${recipientInfo}
**Outreach Goal:** ${goal}
**Company Context:** ${companyContext}
**Tone:** ${tone}

Create exactly 3 variations:
1. **Direct approach:** Get to the point quickly, lead with value
2. **Story-based:** Start with a relatable anecdote or observation
3. **Question-based:** Open with a thought-provoking question

Each email should:
- Have a compelling subject line (7-10 words)
- Be 150-200 words in body
- Include personalization tokens for mail merge ({{firstName}}, {{company}}, etc.)
- Have ONE clear CTA
- Be authentic and non-salesy

Word count must be between 150-200 words for the body.`;

    const result = await generateStructuredOutput(
      {
        prompt: userPrompt,
        systemPrompt,
        schema: ColdEmailGeneratorSchema,
        temperature: 0.8,
      },
      aiConfig
    );

    return result;
  } catch (error) {
    console.error("[generateColdEmail] Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate cold emails"
    );
  }
}

/**
 * Generates platform-specific DM scripts
 */
export async function generateDMScript(
  platform: OutreachPlatform,
  context: string,
  tone: OutreachTone = OutreachTone.CASUAL
): Promise<DMScript> {
  if (!platform || !context) {
    throw new Error("Platform and context are required");
  }

  const aiConfig = getServerAIConfig();
  if (!aiConfig) {
    throw new Error("AI provider not configured. Please check your API keys in Settings.");
  }

  const platformSpecs = getDMPlatformSpecifications(platform);

  try {
    const systemPrompt = `You are a DM outreach specialist who crafts messages that actually get responses.

Your principles:
- NO GENERIC OPENERS: "Hey!" or "Hope you're well" = instant ignore
- REFERENCE THEIR CONTENT: Comment on their recent post/profile
- KEEP IT SHORT: DMs are not emails
- NO ASK IN FIRST MESSAGE: Build rapport first
- PLATFORM-NATIVE: Match the platform's communication style

PLATFORM-SPECIFIC RULES:
**LinkedIn:**
- Professional but personable
- Reference their post/article/company
- Max 300 characters for first message
- Example: "Your post on [topic] resonated—especially [specific point]. I'm working on something similar at [company]."

**Instagram:**
- Casual, emoji-friendly (but not excessive)
- Reference their content/story
- Max 300 characters
- Example: "Loved your reel on [topic]! The part about [X] was so true. Do you [related question]?"

**Twitter:**
- Conversational, witty if appropriate
- Under 280 characters
- Example: "Your thread on [topic] was fire. The [specific insight] changed how I think about [X]."

FOLLOW-UP STRATEGY:
If no response in 3-5 days, send ONE value-add follow-up (article, resource, insight).`;

    const userPrompt = `Generate a DM script for ${platform.toUpperCase()}:

**Platform:** ${platform}
**Context/Reason for Reaching Out:** ${context}
**Tone:** ${tone}
**Character Limit:** ${platformSpecs.characterLimit}
**Style:** ${platformSpecs.style}

Create:
1. Initial DM (under ${platformSpecs.characterLimit} characters)
2. Optional follow-up message (if they don't respond in 3-5 days)

The DM should:
- Reference something specific about them (profile, content, company)
- Be conversational and platform-native
- NOT pitch in the first message
- Build rapport and curiosity

Include exact character count.`;

    const result = await generateStructuredOutput(
      {
        prompt: userPrompt,
        systemPrompt,
        schema: DMScriptSchema,
        temperature: 0.8,
      },
      aiConfig
    );

    return result;
  } catch (error) {
    console.error("[generateDMScript] Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate DM script"
    );
  }
}

/**
 * Generates smart comment replies
 */
export async function generateCommentReply(
  originalComment: string,
  goal: string,
  tone: OutreachTone = OutreachTone.FRIENDLY
): Promise<CommentReply> {
  if (!originalComment || !goal) {
    throw new Error("Original comment and goal are required");
  }

  const aiConfig = getServerAIConfig();
  if (!aiConfig) {
    throw new Error("AI provider not configured. Please check your API keys in Settings.");
  }

  try {
    const systemPrompt = `You are a community engagement specialist who crafts authentic, value-adding comment replies.

Your approach:
- ACKNOWLEDGE FIRST: Show you actually read their comment
- ADD VALUE: Don't just say "Thanks!" or "Great point!"
- BE CONVERSATIONAL: Match their energy and tone
- NO SPAM: Never turn replies into sales pitches
- SOFT SELL ONLY: If a CTA is appropriate, make it subtle and helpful

REPLY STRUCTURE:
1. **Acknowledgment:** "Love this point about [X]!" or "Great question!"
2. **Value Add:** Additional insight, question, resource, or perspective
3. **Optional CTA:** "If you're interested in [X], I wrote about it here: [link]" (use sparingly)

TONE MATCHING:
- If they're enthusiastic → Be enthusiastic back
- If they're asking a question → Give a helpful, detailed answer
- If they're critical → Be empathetic and constructive
- If they're supportive → Show genuine appreciation

GOAL-BASED STRATEGY:
- **Build relationship:** Focus on dialogue, ask follow-up questions
- **Drive traffic:** Subtly mention relevant content/resource
- **Convert to lead:** Offer specific help or free resource
- **Defend/clarify:** Be professional, provide context without being defensive`;

    const userPrompt = `Generate a comment reply for the following:

**Original Comment:** "${originalComment}"
**Reply Goal:** ${goal}
**Desired Tone:** ${tone}

Create a reply that:
1. Acknowledges the original comment specifically
2. Adds value (insight, answer, perspective)
3. Optionally includes a soft CTA if appropriate for the goal

The reply should:
- Feel authentic and conversational
- Match the tone of the original comment
- Be helpful, not promotional
- Be between 50-150 words

Explain:
- How it acknowledges the comment
- What value it adds
- Whether a CTA is included (and why/why not)`;

    const result = await generateStructuredOutput(
      {
        prompt: userPrompt,
        systemPrompt,
        schema: CommentReplySchema,
        temperature: 0.8,
      },
      aiConfig
    );

    return result;
  } catch (error) {
    console.error("[generateCommentReply] Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate comment reply"
    );
  }
}

/**
 * Gets DM platform specifications
 */
function getDMPlatformSpecifications(platform: OutreachPlatform) {
  switch (platform) {
    case OutreachPlatform.LINKEDIN:
      return {
        characterLimit: 300,
        style: "Professional but personable, reference their content/company",
      };
    case OutreachPlatform.INSTAGRAM:
      return {
        characterLimit: 300,
        style: "Casual, emoji-friendly, reference their visual content",
      };
    case OutreachPlatform.TWITTER:
      return {
        characterLimit: 280,
        style: "Conversational, witty if appropriate, concise",
      };
    default:
      return {
        characterLimit: 300,
        style: "Professional and conversational",
      };
  }
}
