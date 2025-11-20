import { getPreferredAIConfig, loadAIConfigsFromEnv } from '@/lib/ai/config';

export async function GET() {
    const envConfigs = loadAIConfigsFromEnv();
    const preferredConfig = getPreferredAIConfig();

    return Response.json({
        envConfigs: envConfigs.map(c => ({
            provider: c.provider,
            model: c.model,
            hasApiKey: !!c.apiKey,
            apiKeyPrefix: c.apiKey?.substring(0, 10) + '...',
        })),
        preferredConfig: preferredConfig ? {
            provider: preferredConfig.provider,
            model: preferredConfig.model,
            hasApiKey: !!preferredConfig.apiKey,
            apiKeyPrefix: preferredConfig.apiKey?.substring(0, 10) + '...',
        } : null,
    });
}
