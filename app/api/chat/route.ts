import { streamText } from 'ai';
import { getServerAIConfig } from '@/lib/ai/config';
import { createLanguageModel } from '@/lib/ai/provider-factory';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Get authenticated user (for future logging/rate limiting)
    await auth();

    // Parse request body
    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 });
    }

    // Get AI configuration
    const aiConfig = getServerAIConfig();
    if (!aiConfig) {
      return new Response(
        'AI provider not configured. Please add ANTHROPIC_API_KEY to environment variables.',
        { status: 500 }
      );
    }

    // Create language model
    const model = createLanguageModel(aiConfig);

    // Build conversation messages
    const messages = [
      {
        role: 'system' as const,
        content: `You are a GTM (Go-To-Market) strategy expert and AI copilot for Campus GTM.

Your role is to help users with:
- Go-to-market strategy and planning
- Student ambassador program design
- Content calendar creation
- Target audience analysis (ICP definition)
- Campus marketing and growth tactics
- Social media strategy for Gen Z
- Competitive analysis
- Outreach and messaging strategy

TONE & STYLE:
- Be conversational, friendly, and encouraging
- Provide specific, actionable advice
- Focus on low-cost, high-impact tactics
- Understand Gen Z communication style
- Think like a startup advisor, not a corporate consultant
- Use examples and concrete recommendations

When users ask questions, provide clear, structured answers with specific next steps they can take.`
      },
      // Add conversation history if provided
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      // Add current message
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Stream the response
    const result = streamText({
      model,
      messages,
      temperature: 0.7,
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}
