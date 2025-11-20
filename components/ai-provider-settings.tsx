"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Sparkles,
  Zap,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AIProvider,
  AIProviderConfig,
  AIModel,
} from "@/types/ai";
import {
  AIProvider as Providers,
  PROVIDER_METADATA,
  OpenAIModel,
  AnthropicModel,
  GoogleModel,
} from "@/types/ai";

interface AIProviderSettingsProps {
  onSave?: (configs: AIProviderConfig[]) => void;
}

const PROVIDER_ICONS = {
  [Providers.GOOGLE]: Sparkles,
  [Providers.ANTHROPIC]: Brain,
  [Providers.OPENAI]: Zap,
};

const PROVIDER_MODELS: Record<AIProvider, readonly AIModel[]> = {
  [Providers.GOOGLE]: Object.values(GoogleModel),
  [Providers.ANTHROPIC]: Object.values(AnthropicModel),
  [Providers.OPENAI]: Object.values(OpenAIModel),
};

export function AIProviderSettings({ onSave }: AIProviderSettingsProps) {
  const [configs, setConfigs] = React.useState<
    Record<AIProvider, AIProviderConfig>
  >(() => {
    // Initialize with empty configs for each provider
    const initial: Record<AIProvider, AIProviderConfig> = {
      [Providers.GOOGLE]: {
        provider: Providers.GOOGLE,
        apiKey: "",
        model: GoogleModel.GEMINI_15_PRO,
        enabled: false,
      },
      [Providers.ANTHROPIC]: {
        provider: Providers.ANTHROPIC,
        apiKey: "",
        model: AnthropicModel.CLAUDE_3_5_SONNET,
        enabled: false,
      },
      [Providers.OPENAI]: {
        provider: Providers.OPENAI,
        apiKey: "",
        model: OpenAIModel.GPT_4O,
        enabled: false,
      },
    };

    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ai-provider-configs");
      if (stored) {
        try {
          return { ...initial, ...JSON.parse(stored) };
        } catch {
          return initial;
        }
      }
    }

    return initial;
  });

  const [showApiKeys, setShowApiKeys] = React.useState<
    Record<AIProvider, boolean>
  >({
    [Providers.GOOGLE]: false,
    [Providers.ANTHROPIC]: false,
    [Providers.OPENAI]: false,
  });

  const handleToggleProvider = (provider: AIProvider) => {
    setConfigs((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled,
      },
    }));
  };

  const handleApiKeyChange = (provider: AIProvider, apiKey: string) => {
    setConfigs((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        apiKey,
      },
    }));
  };

  const handleModelChange = (provider: AIProvider, model: AIModel) => {
    setConfigs((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        model,
      },
    }));
  };

  const handleToggleShowApiKey = (provider: AIProvider) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const handleSave = () => {
    // Validate that at least one provider is enabled with an API key
    const enabledConfigs = Object.values(configs).filter(
      (c) => c.enabled && c.apiKey
    );

    if (enabledConfigs.length === 0) {
      toast.error("Please enable and configure at least one AI provider");
      return;
    }

    // Save to localStorage
    localStorage.setItem("ai-provider-configs", JSON.stringify(configs));

    // Call parent callback
    onSave?.(enabledConfigs);

    toast.success("AI provider settings saved successfully");
  };

  const hasEnabledProvider = Object.values(configs).some(
    (c) => c.enabled && c.apiKey
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Provider Settings</h2>
        <p className="text-muted-foreground">
          Configure your AI provider API keys. Your keys are stored locally and never sent to our servers.
        </p>
      </div>

      <div className="grid gap-6">
        {Object.values(Providers).map((provider, index) => {
          const metadata = PROVIDER_METADATA[provider];
          const config = configs[provider];
          const Icon = PROVIDER_ICONS[provider];
          const models = PROVIDER_MODELS[provider];

          return (
            <motion.div
              key={provider}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={config.enabled ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          config.enabled
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {metadata.name}
                          {metadata.recommended && (
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              Recommended
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>{metadata.description}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={() => handleToggleProvider(provider)}
                    />
                  </div>
                </CardHeader>

                {config.enabled && (
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`${provider}-api-key`}>API Key</Label>
                      <div className="relative">
                        <Input
                          id={`${provider}-api-key`}
                          type={showApiKeys[provider] ? "text" : "password"}
                          value={config.apiKey}
                          onChange={(e) =>
                            handleApiKeyChange(provider, e.target.value)
                          }
                          placeholder={`Enter your ${metadata.name} API key`}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => handleToggleShowApiKey(provider)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showApiKeys[provider] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Get your API key from{" "}
                        <a
                          href={getProviderDocsUrl(provider)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {metadata.name} documentation
                        </a>
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`${provider}-model`}>Model</Label>
                      <select
                        id={`${provider}-model`}
                        value={config.model}
                        onChange={(e) =>
                          handleModelChange(provider, e.target.value as AIModel)
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {models.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Context Window</p>
                        <p className="font-medium">
                          {(metadata.contextWindow / 1000).toLocaleString()}K tokens
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pricing</p>
                        <p className="font-medium">
                          ${metadata.pricing.inputTokenPrice}/1K in
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-3">
          {hasEnabledProvider ? (
            <>
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Ready to generate</p>
                <p className="text-sm text-muted-foreground">
                  {
                    Object.values(configs).filter((c) => c.enabled && c.apiKey)
                      .length
                  }{" "}
                  provider(s) configured
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">No providers configured</p>
                <p className="text-sm text-muted-foreground">
                  Enable at least one provider to start generating
                </p>
              </div>
            </>
          )}
        </div>
        <Button onClick={handleSave} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function getProviderDocsUrl(provider: AIProvider): string {
  switch (provider) {
    case Providers.GOOGLE:
      return "https://ai.google.dev/gemini-api/docs/api-key";
    case Providers.ANTHROPIC:
      return "https://docs.anthropic.com/en/api/getting-started";
    case Providers.OPENAI:
      return "https://platform.openai.com/api-keys";
    default:
      return "#";
  }
}
