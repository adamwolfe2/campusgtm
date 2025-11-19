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

  // Debug: Log all env vars to see what's available
  console.log('[AI Config] Environment check:', {
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasGeminiKey: !!(process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    anthropicKeyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10),
  });

  // Google Gemini (check both variable names)
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
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
    console.log('[AI Config] Anthropic Claude configured successfully');
    configs.push({
      provider: Providers.ANTHROPIC,
      apiKey: anthropicKey,
      model: AnthropicModel.CLAUDE_SONNET_4,
      enabled: true,
    });
  } else {
    console.error('[AI Config] ANTHROPIC_API_KEY not found in environment!');
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
 * Priority: Anthropic Claude > Google Gemini > OpenAI
 */
export function getDefaultAIConfig(): AIProviderConfig | null {
  console.log('[getDefaultAIConfig] Called');
  const configs = loadAIConfigsFromEnv();

  console.log('[getDefaultAIConfig] Loaded configs:', {
    count: configs.length,
    providers: configs.map(c => c.provider),
  });

  if (configs.length === 0) {
    console.error('[getDefaultAIConfig] No configs found - returning null');
    return null;
  }

  // Prioritize Anthropic Claude (recommended)
  const anthropic = configs.find((c) => c.provider === Providers.ANTHROPIC);
  if (anthropic) {
    console.log('[getDefaultAIConfig] Returning Anthropic config');
    return anthropic;
  }

  // Fallback to Google Gemini
  const gemini = configs.find((c) => c.provider === Providers.GOOGLE);
  if (gemini) {
    console.log('[getDefaultAIConfig] Returning Gemini config');
    return gemini;
  }

  // Fallback to OpenAI
  const openai = configs.find((c) => c.provider === Providers.OPENAI);
  if (openai) {
    console.log('[getDefaultAIConfig] Returning OpenAI config');
    return openai;
  }

  console.log('[getDefaultAIConfig] Returning first config:', configs[0].provider);
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
    // Prioritize Anthropic Claude
    const anthropic = localConfigs.find((c) => c.provider === Providers.ANTHROPIC);
    if (anthropic) {
      return anthropic;
    }
    // Fallback to Google Gemini
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

/**
 * Gets AI config for server-side usage (always uses environment variables)
 * Use this in Server Actions and API routes
 */
export function getServerAIConfig(): AIProviderConfig | null {
  console.log('[getServerAIConfig] Called from server action');
  const config = getDefaultAIConfig();
  console.log('[getServerAIConfig] Returning config:', config ? `${config.provider} configured` : 'NULL - NO CONFIG FOUND');
  return config;
}
