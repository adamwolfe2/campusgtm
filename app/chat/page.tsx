"use client"

import { useState } from "react"
import { AppLayout } from "@/components/notion/AppLayout"
import { NotionButton } from "@/components/notion/NotionButton"
import { PromptInput, PromptInputForm, PromptInputTextarea, PromptInputButton } from "@/prompt/prompt-input"
import { Message } from "@/prompt/message"
import { ChainOfThought, Reasoning } from "@/prompt/chain-of-thought"
import { ChatContainer } from "@/prompt/chat-container"
import { CodeBlock } from "@/prompt/code-block"
import ScrambleIn from "@/fancy/text/scramble-in"
import { Sparkles, Send } from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  thinking?: string[]
  code?: {
    language: string
    content: string
  }
  streaming?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI assistant for Campus GTM. I can help you create marketing strategies, analyze ambassador performance, and optimize your tracking links. What would you like to work on today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (value: string) => {
    if (!value.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: value,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'd be happy to help you with that! Let me analyze your request...",
        thinking: [
          "Analyzing the user's request for campus marketing strategy",
          "Reviewing current ambassador performance metrics",
          "Identifying key opportunities for growth",
        ],
        code: value.toLowerCase().includes("code") ? {
          language: "typescript",
          content: `// Example tracking link implementation\nconst createTrackingLink = async (ambassadorId: string) => {\n  const shortCode = generateShortCode();\n  return \`https://campus.gtm/\${shortCode}\`;\n};`,
        } : undefined,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-var(--top-bar-height))] flex flex-col max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--interactive)] to-[var(--accent)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Strategy Assistant</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Powered by Claude, GPT-4, and Gemini
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
          <ChatContainer>
            {messages.map((msg) => (
              <Message
                key={msg.id}
                role={msg.role}
                className="mb-6"
              >
                {msg.thinking && msg.thinking.length > 0 && (
                  <ChainOfThought className="mb-4">
                    {msg.thinking.map((step, i) => (
                      <Reasoning key={i}>
                        <ScrambleIn>{step}</ScrambleIn>
                      </Reasoning>
                    ))}
                  </ChainOfThought>
                )}

                <div className="prose prose-sm max-w-none">
                  <p className="text-[var(--text-primary)] leading-relaxed">
                    {msg.content}
                  </p>
                </div>

                {msg.code && (
                  <CodeBlock language={msg.code.language} className="mt-4">
                    {msg.code.content}
                  </CodeBlock>
                )}
              </Message>
            ))}

            {isLoading && (
              <Message role="assistant" className="mb-6">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[var(--interactive)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-[var(--interactive)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-[var(--interactive)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </Message>
            )}
          </ChatContainer>
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-[var(--border)] bg-[var(--background)]">
          <PromptInput
            value={input}
            onValueChange={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            maxHeight={200}
          >
            <PromptInputForm>
              <PromptInputTextarea
                placeholder="Ask about strategies, ambassadors, tracking links..."
                className="min-h-[60px]"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <PromptInputButton
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`
                    px-4 py-2 rounded-md bg-[var(--interactive)] text-white
                    hover:bg-[var(--interactive-hover)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-[var(--duration-fast)]
                    flex items-center gap-2
                  `}
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </PromptInputButton>
              </div>
            </PromptInputForm>
          </PromptInput>
        </div>
      </div>
    </AppLayout>
  )
}
