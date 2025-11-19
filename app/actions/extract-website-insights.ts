'use server';

import { generateText } from 'ai';
import { createLanguageModel } from '@/lib/ai/provider-factory';
import { getPreferredAIConfig } from '@/lib/ai/config';
import type { ScrapedWebsiteData } from '@/lib/scraper/web-scraper';

export interface ExtractedInsights {
    companyName: string;
    industry: string;
    targetAudience: string;
    valueProposition: string;
    competitors: string[];
    description: string;
}

export async function extractWebsiteInsights(
    scrapedData: ScrapedWebsiteData
): Promise<{ success: boolean; insights?: ExtractedInsights; error?: string }> {
    try {
        const aiConfig = getPreferredAIConfig();
        if (!aiConfig) {
            throw new Error('AI provider not configured');
        }

        const model = createLanguageModel(aiConfig);

        const prompt = `Analyze this company website and extract key information:

URL: ${scrapedData.url}
Title: ${scrapedData.title}
Description: ${scrapedData.description}

Key Headings: ${scrapedData.headings.slice(0, 5).join(', ')}

Main Content:
${scrapedData.mainContent.substring(0, 3000)}

Extract the following information and return ONLY valid JSON (no markdown, no code blocks):
{
  "companyName": "Official company name from the website",
  "industry": "Primary industry - choose from: EdTech, FinTech, HealthTech, E-commerce, SaaS, Marketplace, Social Platform, or Other",
  "targetAudience": "Specific target audience description (be detailed about demographics and use case)",
  "valueProposition": "What makes them unique in one sentence",
  "competitors": ["competitor1", "competitor2", "competitor3"],
  "description": "2-sentence company description"
}

Return ONLY the JSON object, nothing else.`;

        const result = await generateText({
            model,
            prompt,
            temperature: 0.3, // Lower for more factual extraction
        });

        // Try to parse JSON from response
        let jsonText = result.text.trim();

        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Find JSON object
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response - no JSON found');
        }

        const insights = JSON.parse(jsonMatch[0]) as ExtractedInsights;

        // Validate required fields
        if (!insights.companyName || !insights.industry) {
            throw new Error('AI response missing required fields');
        }

        return { success: true, insights };
    } catch (error) {
        console.error('AI extraction failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
