/**
 * AI Configuration Management
 * Handles loading AI provider configs from environment variables and user settings
 */

import type { AIProviderConfig, AIProvider } from "@/types/ai";
import {
  AIProvider as Providers,
  OpenAIModel,
  AnthropicModel,
  GoogleModel,
} from "@/types/ai";

/**
 * Loads AI provider configurations from environment variables
 * This is used for server-side operations
 */
export function loadAIConfigsFromEnv(): AIProviderConfig[] {
  const configs: AIProviderConfig[] = [];

  // Google Gemini
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (geminiKey) {
    configs.push({
      provider: Providers.GOOGLE,
      apiKey: geminiKey,
      model: GoogleModel.GEMINI_15_PRO,
      enabled: true,
    });
  }

  // Anthropic Claude
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    configs.push({
      provider: Providers.ANTHROPIC,
      apiKey: anthropicKey,
      model: AnthropicModel.CLAUDE_3_5_SONNET,
      enabled: true,
    });
  }

  // OpenAI
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    configs.push({
      provider: Providers.OPENAI,
      apiKey: openaiKey,
      model: OpenAIModel.GPT_4O,
      enabled: true,
    });
  }

  return configs;
}

/**
 * Gets the default AI provider configuration
 * Priority: Google Gemini > Anthropic > OpenAI
 */
export function getDefaultAIConfig(): AIProviderConfig | null {
  const configs = loadAIConfigsFromEnv();

  if (configs.length === 0) {
    return null;
  }

  // Prioritize Google Gemini if available (recommended)
  const gemini = configs.find((c) => c.provider === Providers.GOOGLE);
  if (gemini) {
    return gemini;
  }

  // Fallback to Anthropic
  const anthropic = configs.find((c) => c.provider === Providers.ANTHROPIC);
  if (anthropic) {
    return anthropic;
  }

  // Fallback to OpenAI
  const openai = configs.find((c) => c.provider === Providers.OPENAI);
  if (openai) {
    return openai;
  }

  return configs[0];
}

/**
 * Gets a specific provider configuration
 */
export function getAIConfig(provider: AIProvider): AIProviderConfig | null {
  const configs = loadAIConfigsFromEnv();
  return configs.find((c) => c.provider === provider) ?? null;
}

/**
 * Checks if any AI provider is configured
 */
export function hasAIProviderConfigured(): boolean {
  return loadAIConfigsFromEnv().length > 0;
}

/**
 * Loads AI provider configs from localStorage (client-side)
 */
export function loadAIConfigsFromLocalStorage(): AIProviderConfig[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem("ai-provider-configs");
    if (!stored) {
      return [];
    }

    const configs: Record<AIProvider, AIProviderConfig> = JSON.parse(stored);
    return Object.values(configs).filter((c) => c.enabled && c.apiKey);
  } catch {
    return [];
  }
}

/**
 * Gets the preferred AI config (user settings > environment variables)
 */
export function getPreferredAIConfig(): AIProviderConfig | null {
  // Try localStorage first (user settings)
  const localConfigs = loadAIConfigsFromLocalStorage();
  if (localConfigs.length > 0) {
    // Prioritize Google Gemini
    const gemini = localConfigs.find((c) => c.provider === Providers.GOOGLE);
    if (gemini) {
      return gemini;
    }
    return localConfigs[0];
  }

  // Fallback to environment variables
  return getDefaultAIConfig();
}

/**
 * Saves AI provider config to localStorage
 */
export function saveAIConfigToLocalStorage(
  configs: Record<AIProvider, AIProviderConfig>
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("ai-provider-configs", JSON.stringify(configs));
}

/**
 * Clears AI provider configs from localStorage
 */
export function clearAIConfigsFromLocalStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("ai-provider-configs");
}
