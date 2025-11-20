/**
 * AI Provider Types and Configuration
 * Model-agnostic architecture for supporting multiple AI providers
 */

import { z } from "zod";

export const AIProvider = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GOOGLE: "google",
} as const;

export type AIProvider = (typeof AIProvider)[keyof typeof AIProvider];

export const AICapability = {
  TEXT_GENERATION: "text_generation",
  IMAGE_GENERATION: "image_generation",
  STRUCTURED_OUTPUT: "structured_output",
  LONG_CONTEXT: "long_context",
  FUNCTION_CALLING: "function_calling",
} as const;

export type AICapability = (typeof AICapability)[keyof typeof AICapability];

/**
 * Available models for each provider
 */
export const OpenAIModel = {
  GPT_4_TURBO: "gpt-4-turbo-preview",
  GPT_4: "gpt-4",
  GPT_4O: "gpt-4o",
  GPT_4O_MINI: "gpt-4o-mini",
  GPT_35_TURBO: "gpt-3.5-turbo",
} as const;

export type OpenAIModel = (typeof OpenAIModel)[keyof typeof OpenAIModel];

export const AnthropicModel = {
  CLAUDE_SONNET_4: "claude-sonnet-4-20250514",
  CLAUDE_3_5_SONNET: "claude-3-5-sonnet-20241022",
  CLAUDE_3_OPUS: "claude-3-opus-20240229",
  CLAUDE_3_SONNET: "claude-3-sonnet-20240229",
  CLAUDE_3_HAIKU: "claude-3-haiku-20240307",
} as const;

export type AnthropicModel =
  (typeof AnthropicModel)[keyof typeof AnthropicModel];

export const GoogleModel = {
  GEMINI_15_PRO: "gemini-1.5-pro",
  GEMINI_15_FLASH: "gemini-1.5-flash",
  GEMINI_PRO: "gemini-pro",
} as const;

export type GoogleModel = (typeof GoogleModel)[keyof typeof GoogleModel];

export type AIModel = OpenAIModel | AnthropicModel | GoogleModel;

/**
 * Provider configuration schema with Zod validation
 */
export const AIProviderConfigSchema = z.object({
  provider: z.enum([AIProvider.OPENAI, AIProvider.ANTHROPIC, AIProvider.GOOGLE]),
  apiKey: z.string().min(1, "API key is required"),
  model: z.string(),
  enabled: z.boolean().default(true),
  capabilities: z.array(z.string()).optional(),
});

export type AIProviderConfig = z.infer<typeof AIProviderConfigSchema>;

/**
 * User AI settings (stored in database or local storage)
 */
export interface UserAISettings {
  id: string;
  userId?: string;
  providers: AIProviderConfig[];
  defaultProvider: AIProvider;
  preferences: AIPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIPreferences {
  temperature: number;
  maxTokens: number;
  streamResponses: boolean;
  enableStructuredOutput: boolean;
}

/**
 * AI Generation Request
 */
export interface AIGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  context?: string;
  provider?: AIProvider;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  structuredOutput?: boolean;
  schema?: z.ZodSchema;
}

/**
 * AI Generation Response
 */
export interface AIGenerationResponse {
  content: string;
  provider: AIProvider;
  model: AIModel;
  tokensUsed?: number;
  finishReason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Conversational AI Message
 */
export interface AIMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Conversation Session
 */
export interface AIConversation {
  id: string;
  userId?: string;
  messages: AIMessage[];
  context?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GTM Strategy Generation Request
 */
export interface GTMStrategyRequest {
  companyName: string;
  companyUrl?: string;
  industry: string;
  targetAudience: string;
  goals: string[];
  competitors: string[];
  budget?: string;
  timeline?: string;
  uploadedDocs?: string[];
}

/**
 * GTM Strategy Response (structured output)
 */
export const GTMStrategySchema = z.object({
  summary: z.string(),
  ambassadorProgram: z.object({
    roles: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        compensation: z.object({
          type: z.enum(["swag", "cash", "mixed"]),
          details: z.string(),
        }),
        responsibilities: z.array(z.string()),
      })
    ),
    launchTasks: z.array(z.string()),
  }),
  contentCalendar: z.object({
    weeks: z.array(
      z.object({
        week: z.number(),
        theme: z.string(),
        posts: z.array(
          z.object({
            day: z.number(),
            platform: z.string(),
            contentType: z.string(),
            description: z.string(),
          })
        ),
      })
    ),
  }),
  icpDefinition: z.object({
    demographics: z.string(),
    psychographics: z.string(),
    painPoints: z.array(z.string()),
    channels: z.array(z.string()),
  }),
  outreachScripts: z.array(
    z.object({
      channel: z.string(),
      script: z.string(),
      cta: z.string(),
    })
  ),
  viralityTactics: z.array(
    z.object({
      tactic: z.string(),
      description: z.string(),
      implementation: z.string(),
    })
  ),
});

export type GTMStrategy = z.infer<typeof GTMStrategySchema>;

/**
 * Provider capabilities metadata
 */
export interface ProviderMetadata {
  provider: AIProvider;
  name: string;
  description: string;
  capabilities: AICapability[];
  contextWindow: number;
  supportedModels: readonly string[];
  pricing: {
    inputTokenPrice: number;
    outputTokenPrice: number;
  };
  recommended: boolean;
}

export const PROVIDER_METADATA: Record<AIProvider, ProviderMetadata> = {
  [AIProvider.GOOGLE]: {
    provider: AIProvider.GOOGLE,
    name: "Google Gemini",
    description: "2M token context window - best for document-heavy GTM strategies",
    capabilities: [
      AICapability.TEXT_GENERATION,
      AICapability.STRUCTURED_OUTPUT,
      AICapability.LONG_CONTEXT,
      AICapability.FUNCTION_CALLING,
    ],
    contextWindow: 2000000,
    supportedModels: Object.values(GoogleModel),
    pricing: {
      inputTokenPrice: 0.000125,
      outputTokenPrice: 0.000375,
    },
    recommended: true,
  },
  [AIProvider.ANTHROPIC]: {
    provider: AIProvider.ANTHROPIC,
    name: "Anthropic Claude",
    description: "Best reasoning and analysis - great for strategic insights",
    capabilities: [
      AICapability.TEXT_GENERATION,
      AICapability.STRUCTURED_OUTPUT,
      AICapability.FUNCTION_CALLING,
    ],
    contextWindow: 200000,
    supportedModels: Object.values(AnthropicModel),
    pricing: {
      inputTokenPrice: 0.003,
      outputTokenPrice: 0.015,
    },
    recommended: false,
  },
  [AIProvider.OPENAI]: {
    provider: AIProvider.OPENAI,
    name: "OpenAI GPT",
    description: "Industry standard - reliable and well-documented",
    capabilities: [
      AICapability.TEXT_GENERATION,
      AICapability.IMAGE_GENERATION,
      AICapability.STRUCTURED_OUTPUT,
      AICapability.FUNCTION_CALLING,
    ],
    contextWindow: 128000,
    supportedModels: Object.values(OpenAIModel),
    pricing: {
      inputTokenPrice: 0.01,
      outputTokenPrice: 0.03,
    },
    recommended: false,
  },
};
