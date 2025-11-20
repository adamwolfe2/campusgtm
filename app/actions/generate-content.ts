"use server";

import { generateAIText } from "@/lib/ai/service";
import { getServerAIConfig } from "@/lib/ai/config";

export async function generateContentAction(prompt: string) {
    if (!prompt) {
        throw new Error("Prompt is required");
    }

    // Use the same AI config as the rest of the app (Anthropic by default)
    const aiConfig = getServerAIConfig();

    if (!aiConfig) {
        console.error("[generateContent] No AI provider configured");
        return {
            success: false,
            error: "AI provider not configured. Please check your API keys in Settings."
        };
    }

    try {
        const response = await generateAIText(
            {
                prompt,
                systemPrompt: "You are a helpful AI writing assistant embedded in a Notion-style editor. Your goal is to help the user write content. Output ONLY the requested content, formatted in Markdown. Do not include conversational filler like 'Here is the content'. Use headings, lists, and bold text where appropriate.",
                temperature: 0.7,
            },
            aiConfig
        );

        return { success: true, content: response.content };
    } catch (error) {
        console.error("[generateContent] AI Generation Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate content"
        };
    }
}
