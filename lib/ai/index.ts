/**
 * AI Module - Model-Agnostic Architecture
 *
 * This module provides a unified interface for working with multiple AI providers:
 * - Google Gemini (2M token context - recommended for document-heavy strategies)
 * - Anthropic Claude (Superior reasoning and analysis)
 * - OpenAI GPT (Versatile with image generation capabilities)
 *
 * Users can configure their own API keys via the Settings UI or environment variables.
 * The architecture supports seamless switching between providers without code changes.
 */

export {
  generateAIText,
  streamAIText,
  generateStructuredOutput,
  generateGTMStrategy,
  conductOnboardingConversation,
} from "./service";

export {
  createLanguageModel,
  validateProviderConfig,
  getDefaultModel,
  estimateTokens,
  supportsCapability,
  formatProviderError,
} from "./provider-factory";

export {
  loadAIConfigsFromEnv,
  getDefaultAIConfig,
  getAIConfig,
  hasAIProviderConfigured,
  loadAIConfigsFromLocalStorage,
  getPreferredAIConfig,
  saveAIConfigToLocalStorage,
  clearAIConfigsFromLocalStorage,
} from "./config";
