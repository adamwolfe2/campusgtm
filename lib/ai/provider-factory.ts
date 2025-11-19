/**
 * AI Provider Factory
 * Model-agnostic abstraction layer for different AI providers
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import type {
  AIProvider,
  AIProviderConfig,
  AIModel,
} from "@/types/ai";
import { AIProvider as Providers } from "@/types/ai";

/**
 * Creates a language model instance based on provider configuration
 */
export function createLanguageModel(config: AIProviderConfig): LanguageModel {
  const { provider, apiKey, model } = config;

  switch (provider) {
    case Providers.OPENAI: {
      const openai = createOpenAI({
        apiKey,
        compatibility: "strict",
      });
      return openai(model as AIModel);
    }

    case Providers.ANTHROPIC: {
      const anthropic = createAnthropic({
        apiKey,
      });
      return anthropic(model as AIModel);
    }

    case Providers.GOOGLE: {
      const google = createGoogleGenerativeAI({
        apiKey,
      });
      return google(model as AIModel);
    }

    default: {
      const exhaustiveCheck: never = provider;
      throw new Error(`Unsupported provider: ${exhaustiveCheck}`);
    }
  }
}

/**
 * Validates provider configuration
 */
export function validateProviderConfig(
  config: AIProviderConfig
): { valid: boolean; error?: string } {
  if (!config.apiKey || config.apiKey.trim() === "") {
    return { valid: false, error: "API key is required" };
  }

  if (!config.model || config.model.trim() === "") {
    return { valid: false, error: "Model is required" };
  }

  if (!Object.values(Providers).includes(config.provider)) {
    return { valid: false, error: "Invalid provider" };
  }

  return { valid: true };
}

/**
 * Gets the default model for a provider
 */
export function getDefaultModel(provider: AIProvider): AIModel {
  switch (provider) {
    case Providers.OPENAI:
      return "gpt-4o" as AIModel;
    case Providers.ANTHROPIC:
      return "claude-3-5-sonnet-20241022" as AIModel;
    case Providers.GOOGLE:
      return "gemini-1.5-pro-latest" as AIModel;
    default: {
      const exhaustiveCheck: never = provider;
      throw new Error(`Unsupported provider: ${exhaustiveCheck}`);
    }
  }
}

/**
 * Estimates token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Checks if a provider supports a specific capability
 */
export function supportsCapability(
  provider: AIProvider,
  capability: string
): boolean {
  const metadata = getProviderMetadata(provider);
  return metadata.capabilities.includes(capability as never);
}

/**
 * Gets provider metadata
 */
function getProviderMetadata(provider: AIProvider) {
  const { PROVIDER_METADATA } = require("@/types/ai");
  return PROVIDER_METADATA[provider];
}

/**
 * Formats error messages for different providers
 */
export function formatProviderError(
  provider: AIProvider,
  error: unknown
): string {
  const baseMessage = "AI generation failed";

  if (error instanceof Error) {
    // Check for common API key errors
    if (
      error.message.includes("401") ||
      error.message.includes("authentication") ||
      error.message.includes("API key")
    ) {
      return `Invalid API key for ${provider}. Please check your settings.`;
    }

    // Check for rate limit errors
    if (
      error.message.includes("429") ||
      error.message.includes("rate limit")
    ) {
      return `Rate limit exceeded for ${provider}. Please try again later.`;
    }

    // Check for quota errors
    if (error.message.includes("quota") || error.message.includes("billing")) {
      return `Quota exceeded for ${provider}. Please check your billing settings.`;
    }

    return `${baseMessage}: ${error.message}`;
  }

  return baseMessage;
}
