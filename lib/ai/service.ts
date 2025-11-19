/**
 * AI Service Layer
 * High-level service for AI generation with streaming and structured output
 */

import { generateText, streamText, generateObject } from "ai";
import type { z } from "zod";
import type {
  AIGenerationRequest,
  AIGenerationResponse,
  AIProviderConfig,
  GTMStrategyRequest,
  GTMStrategy,
  AIModel,
} from "@/types/ai";
import { GTMStrategySchema } from "@/types/ai";
import {
  createLanguageModel,
  validateProviderConfig,
  formatProviderError,
} from "./provider-factory";

/**
 * Generates text using the specified AI provider
 */
export async function generateAIText(
  request: AIGenerationRequest,
  providerConfig: AIProviderConfig
): Promise<AIGenerationResponse> {
  // Validate configuration
  const validation = validateProviderConfig(providerConfig);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    const model = createLanguageModel(providerConfig);

    // Build messages
    const messages = [];

    if (request.systemPrompt) {
      messages.push({
        role: "system" as const,
        content: request.systemPrompt,
      });
    }

    if (request.context) {
      messages.push({
        role: "system" as const,
        content: `Context: ${request.context}`,
      });
    }

    messages.push({
      role: "user" as const,
      content: request.prompt,
    });

    // Generate text
    const result = await generateText({
      model,
      messages,
      temperature: request.temperature ?? 0.7,
    });

    return {
      content: result.text,
      provider: providerConfig.provider,
      model: providerConfig.model as AIModel,
      tokensUsed: result.usage?.totalTokens,
      finishReason: result.finishReason,
    };
  } catch (error) {
    const errorMessage = formatProviderError(providerConfig.provider, error);
    throw new Error(errorMessage);
  }
}

/**
 * Streams text generation (for real-time UI updates)
 */
export async function streamAIText(
  request: AIGenerationRequest,
  providerConfig: AIProviderConfig
) {
  // Validate configuration
  const validation = validateProviderConfig(providerConfig);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    const model = createLanguageModel(providerConfig);

    // Build messages
    const messages = [];

    if (request.systemPrompt) {
      messages.push({
        role: "system" as const,
        content: request.systemPrompt,
      });
    }

    if (request.context) {
      messages.push({
        role: "system" as const,
        content: `Context: ${request.context}`,
      });
    }

    messages.push({
      role: "user" as const,
      content: request.prompt,
    });

    // Stream text
    const result = await streamText({
      model,
      messages,
      temperature: request.temperature ?? 0.7,
    });

    return result;
  } catch (error) {
    const errorMessage = formatProviderError(providerConfig.provider, error);
    throw new Error(errorMessage);
  }
}

/**
 * Generates structured output using Zod schema
 */
export async function generateStructuredOutput<T>(
  request: AIGenerationRequest & { schema: z.ZodSchema<T> },
  providerConfig: AIProviderConfig
): Promise<T> {
  // Validate configuration
  const validation = validateProviderConfig(providerConfig);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    const model = createLanguageModel(providerConfig);

    // Build prompt with context
    let fullPrompt = request.prompt;
    if (request.context) {
      fullPrompt = `Context: ${request.context}\n\n${request.prompt}`;
    }

    // Generate structured output
    const result = await generateObject({
      model,
      schema: request.schema,
      prompt: fullPrompt,
      temperature: request.temperature ?? 0.7,
    });

    return result.object;
  } catch (error) {
    const errorMessage = formatProviderError(providerConfig.provider, error);
    throw new Error(errorMessage);
  }
}

/**
 * Generates a complete GTM strategy (the core feature)
 */
export async function generateGTMStrategy(
  request: GTMStrategyRequest,
  providerConfig: AIProviderConfig
): Promise<GTMStrategy> {
  // Build the system prompt with GTM playbook templates
  const systemPrompt = buildGTMSystemPrompt();

  // Build the user prompt from request data
  const userPrompt = buildGTMUserPrompt(request);

  // Generate structured output
  const strategy = await generateStructuredOutput(
    {
      prompt: userPrompt,
      systemPrompt,
      schema: GTMStrategySchema,
      temperature: 0.7,
      maxTokens: 4000,
    },
    providerConfig
  );

  return strategy;
}

/**
 * Builds the GTM system prompt with playbook templates
 */
function buildGTMSystemPrompt(): string {
  return `You are a Y-Combinator level Growth Expert specializing in Student Ambassador programs and Campus GTM strategies.

Your role is to analyze company data and generate comprehensive, actionable GTM strategies focused on:
1. Student Ambassador Programs (3-tier structure: Scout, Captain, Lead)
2. Content Calendars (4-week campaigns: Awareness → Education → Social Proof → Conversion)
3. ICP Definitions (Deep understanding of Gen Z and college demographics)
4. Outreach Scripts (Authentic, non-salesy, value-first messaging)
5. Virality Tactics (Campus-specific guerilla marketing)

CRITICAL REQUIREMENTS:
- Be specific and actionable. No generic advice.
- Focus on low-cost, high-impact tactics suitable for startups.
- Understand Gen Z communication style (authentic, transparent, community-driven).
- Prioritize organic growth over paid advertising.
- Think like a college student, not a corporate marketer.

OUTPUT FORMAT:
Always return structured JSON matching the exact schema provided. Be thorough but concise.`;
}

/**
 * Builds the user prompt from GTM strategy request
 */
function buildGTMUserPrompt(request: GTMStrategyRequest): string {
  let prompt = `Generate a comprehensive Campus GTM strategy for the following company:

**Company:** ${request.companyName}`;

  if (request.companyUrl) {
    prompt += `\n**Website:** ${request.companyUrl}`;
  }

  prompt += `\n**Industry:** ${request.industry}`;
  prompt += `\n**Target Audience:** ${request.targetAudience}`;

  if (request.goals.length > 0) {
    prompt += `\n\n**Goals:**\n${request.goals.map((g) => `- ${g}`).join("\n")}`;
  }

  if (request.competitors.length > 0) {
    prompt += `\n\n**Competitors:**\n${request.competitors.map((c) => `- ${c}`).join("\n")}`;
  }

  if (request.budget) {
    prompt += `\n\n**Budget:** ${request.budget}`;
  }

  if (request.timeline) {
    prompt += `\n**Timeline:** ${request.timeline}`;
  }

  if (request.uploadedDocs && request.uploadedDocs.length > 0) {
    prompt += `\n\n**Additional Context:**\nThe company has provided the following documents:\n${request.uploadedDocs.join("\n")}`;
  }

  prompt += `\n\nBased on this information, create a detailed GTM strategy with:
1. A 3-tier Student Ambassador program with specific roles, compensation, and responsibilities
2. A 4-week content calendar with daily posts across platforms
3. A detailed ICP definition
4. Outreach scripts for different channels
5. 3 creative virality tactics for campus marketing

Make it specific to this company and their unique value proposition.`;

  return prompt;
}

/**
 * Conversational onboarding - asks follow-up questions
 */
export async function conductOnboardingConversation(
  userResponses: Record<string, string>,
  providerConfig: AIProviderConfig
): Promise<AIGenerationResponse> {
  const systemPrompt = `You are a friendly GTM strategist conducting an onboarding interview.

Your goal is to gather information about the company to build a GTM strategy.

Ask ONE question at a time in a conversational, Typeform-style manner.
Be warm, encouraging, and specific.

Questions to cover:
1. Company name and what they do
2. Target audience (be specific - not just "college students")
3. Main goals (MRR targets, user acquisition, etc.)
4. Top 3 competitors
5. Unique value proposition
6. Current marketing channels (if any)
7. Budget constraints

STYLE:
- Use casual, friendly language
- Keep questions short (1-2 sentences)
- Show enthusiasm about their answers
- Avoid corporate jargon`;

  const conversationHistory = Object.entries(userResponses)
    .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
    .join("\n\n");

  const prompt = conversationHistory
    ? `Previous conversation:\n${conversationHistory}\n\nWhat's the next question to ask?`
    : "Start the onboarding conversation with the first question.";

  return generateAIText(
    {
      prompt,
      systemPrompt,
      temperature: 0.8,
      maxTokens: 200,
    },
    providerConfig
  );
}
