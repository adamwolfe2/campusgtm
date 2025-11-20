"use server";

import { generateAIText } from "@/lib/ai/service";
import { AIProviderConfig } from "@/types/ai";

// Default provider config - in a real app, this might come from user settings or env vars
const defaultProviderConfig: AIProviderConfig = {
    provider: "google", // Default to Gemini as requested
    model: "gemini-1.5-flash-latest",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    enabled: true,
};

export async function generateContentAction(prompt: string) {
    if (!prompt) {
        throw new Error("Prompt is required");
    }

    try {
        const response = await generateAIText(
            {
                prompt,
                systemPrompt: "You are a helpful AI writing assistant embedded in a Notion-style editor. Your goal is to help the user write content. Output ONLY the requested content, formatted in Markdown. Do not include conversational filler like 'Here is the content'. Use headings, lists, and bold text where appropriate.",
                temperature: 0.7,
                maxTokens: 2000,
            },
            defaultProviderConfig
        );

        return { success: true, content: response.content };
    } catch (error) {
        console.error("AI Generation Error:", error);
        return { success: false, error: "Failed to generate content" };
    }
}
