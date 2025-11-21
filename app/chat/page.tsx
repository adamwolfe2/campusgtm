"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import ScrambleIn from "@/fancy/text/scramble-in"
import BreathingText from "@/fancy/text/breathing-text"
import { PromptInput } from "@/prompt/prompt-input"
import { Message } from "@/prompt/message"
import { Reasoning } from "@/prompt/reasoning"
import { ChatContainerRoot as ChatContainer } from "@/prompt/chat-container"
import { CodeBlock } from "@/prompt/code-block"
import { Loader } from "@/prompt/loader"
import { SystemMessage } from "@/prompt/system-message"
import { PromptSuggestion } from "@/prompt/prompt-suggestion"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { Card } from "@/ui/card"
import {
  Sparkles,
  Send,
  Brain,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
  Code,
  FileText,
  Image as ImageIcon,
  Plus,
  Settings,
  Trash2,
  RotateCcw,
  Download,
  Share2,
  BookOpen,
  Lightbulb,
  Users,
  Link as LinkIcon
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  reasoning?: string[]
  code?: {
    language: string
    content: string
  }
  streaming?: boolean
  timestamp?: string
}

const suggestionPrompts = [
  {
    icon: Brain,
    title: "Generate GTM Strategy",
    description: "Create a comprehensive go-to-market strategy",
    prompt: "Help me create a GTM strategy for launching a new student ambassador program at my university",
  },
  {
    icon: Users,
    title: "Ambassador Structure",
    description: "Design a multi-tier ambassador program",
    prompt: "Design a 3-tier student ambassador program structure with roles, responsibilities, and incentives",
  },
  {
    icon: Target,
    title: "Optimize Conversions",
    description: "Improve tracking link performance",
    prompt: "Analyze my ambassador tracking links and suggest ways to improve conversion rates",
  },
  {
    icon: TrendingUp,
    title: "Growth Strategy",
    description: "Scale your campus presence",
    prompt: "What are the best strategies to scale from 10 to 100 campus ambassadors in 3 months?",
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content: "Welcome to Campus GTM AI",
      timestamp: new Date().toISOString(),
    },
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI copilot for Campus GTM. I can help you:\n\n• Generate comprehensive go-to-market strategies\n• Design and optimize ambassador programs\n• Create tracking links and analyze performance\n• Develop campus marketing campaigns\n• Generate content for your ambassadors\n\nWhat would you like to work on today?",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const simulateStreaming = async (content: string, reasoning?: string[]) => {
    const messageId = Date.now().toString()

    // Show reasoning first
    if (reasoning && reasoning.length > 0) {
      for (let i = 0; i < reasoning.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        setStreamingMessage({
          id: messageId,
          role: "assistant",
          content: "",
          reasoning: reasoning.slice(0, i + 1),
          streaming: true,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Stream content word by word
    const words = content.split(" ")
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      const partialContent = words.slice(0, i + 1).join(" ")
      setStreamingMessage({
        id: messageId,
        role: "assistant",
        content: partialContent,
        reasoning: reasoning,
        streaming: true,
        timestamp: new Date().toISOString(),
      })
    }

    // Finalize message
    const finalMessage: ChatMessage = {
      id: messageId,
      role: "assistant",
      content,
      reasoning,
      streaming: false,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, finalMessage])
    setStreamingMessage(null)
    setIsLoading(false)
  }

  const handleSubmit = async (value: string) => {
    if (!value.trim() || isLoading) return

    setShowSuggestions(false)

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: value,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response with reasoning
    const reasoning = [
      "Analyzing your request and current campus marketing landscape",
      "Reviewing best practices from top university programs",
      "Generating comprehensive strategy based on proven frameworks",
      "Optimizing recommendations for maximum ROI",
    ]

    let responseContent = ""
    if (value.toLowerCase().includes("strategy") || value.toLowerCase().includes("gtm")) {
      responseContent = `I'll help you create a comprehensive GTM strategy. Here's a structured approach:

**Phase 1: Foundation (Weeks 1-2)**
- Define your target audience and ideal customer profile
- Set clear, measurable goals (e.g., 500 signups in Q1)
- Identify your unique value proposition

**Phase 2: Ambassador Recruitment (Weeks 3-4)**
- Create ambassador job descriptions for each tier
- Launch recruitment campaign across campus channels
- Screen and onboard top candidates

**Phase 3: Execution (Weeks 5-8)**
- Distribute custom tracking links to each ambassador
- Launch coordinated campus campaigns
- Monitor performance in real-time

**Phase 4: Optimization (Ongoing)**
- Analyze which ambassadors and tactics are most effective
- Iterate on messaging and incentives
- Scale what works, cut what doesn't

Would you like me to elaborate on any specific phase?`
    } else if (value.toLowerCase().includes("ambassador")) {
      responseContent = `Here's a proven 3-tier ambassador structure:

**Tier 1: Campus Leaders (5-10 people)**
- Compensation: $500/month + equity
- Responsibilities: Recruit Tier 2, strategic planning, events
- Requirements: Campus influencer, proven track record

**Tier 2: Ambassador Captains (20-30 people)**
- Compensation: $200/month + bonuses
- Responsibilities: Manage Tier 3, content creation, weekly posts
- Requirements: Active in 2+ student orgs, strong social presence

**Tier 3: Brand Ambassadors (50-100 people)**
- Compensation: Commission-based ($10 per signup)
- Responsibilities: Share tracking links, attend events
- Requirements: Enthusiastic, reliable, campus presence

Each tier gets:
- Custom tracking links
- Marketing materials
- Exclusive swag
- Performance leaderboard access

Want me to help you set up the recruitment process?`
    } else {
      responseContent = `I'd be happy to help with that! Based on your question, here are my recommendations:

1. **Immediate Actions**: Start by setting up tracking links for your ambassadors so you can measure impact from day one.

2. **Best Practices**: Focus on quality over quantity - 10 engaged ambassadors are better than 100 passive ones.

3. **Success Metrics**: Track clicks, signups, and retention. Aim for a 10%+ conversion rate from clicks to signups.

Want me to dive deeper into any of these areas?`
    }

    await simulateStreaming(responseContent, reasoning)
  }

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt)
    handleSubmit(prompt)
  }

  const handleNewChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "system",
        content: "New conversation started",
        timestamp: new Date().toISOString(),
      },
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm your AI copilot for Campus GTM. What would you like to work on?",
        timestamp: new Date().toISOString(),
      },
    ])
    setShowSuggestions(true)
    setInput("")
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex flex-col overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-30 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-transparent" />
      <div className="fixed inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />

      {/* Navigation */}
      <motion.nav
        className="relative z-10 backdrop-blur-xl bg-black/30 border-b border-white/10 flex-shrink-0"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Campus GTM</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleNewChat} className="text-gray-300 hover:text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Link href="/workspaces">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Workspaces
              </Button>
            </Link>
            <Link href="/ambassadors">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Ambassadors
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Chat Header */}
      <motion.div
        className="relative z-10 backdrop-blur-xl bg-black/20 border-b border-white/10 flex-shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black">
                  <BreathingText text="AI Strategy Copilot" />
                </h1>
                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Powered by Claude, GPT-4 & Gemini
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 border-purple-500/30 text-purple-300">
              <Zap className="w-3 h-3 mr-1" />
              Fast Mode
            </Badge>
            <Badge className="bg-blue-500/20 border-blue-500/30 text-blue-300">
              <Brain className="w-3 h-3 mr-1" />
              Deep Thinking
            </Badge>
            <Badge className="bg-green-500/20 border-green-500/30 text-green-300">
              <Target className="w-3 h-3 mr-1" />
              GTM Expert
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <ChatContainer>
            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="mb-8"
                >
                  {msg.role === "system" ? (
                    <SystemMessage>{msg.content}</SystemMessage>
                  ) : (
                    <Message role={msg.role} timestamp={msg.timestamp}>
                      {msg.reasoning && msg.reasoning.length > 0 && (
                        <div className="mb-6 space-y-3">
                          {msg.reasoning.map((step, i) => (
                            <motion.div
                              key={i}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.4, delay: i * 0.2 }}
                            >
                              <Reasoning>
                                <ScrambleIn delay={i * 200}>{step}</ScrambleIn>
                              </Reasoning>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>

                      {msg.code && (
                        <CodeBlock language={msg.code.language} className="mt-6">
                          {msg.code.content}
                        </CodeBlock>
                      )}

                      {msg.role === "assistant" && !msg.streaming && (
                        <div className="flex items-center gap-2 mt-4">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs">
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Regenerate
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs">
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs">
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      )}
                    </Message>
                  )}
                </motion.div>
              ))}

              {streamingMessage && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-8"
                >
                  <Message role="assistant" timestamp={streamingMessage.timestamp}>
                    {streamingMessage.reasoning && streamingMessage.reasoning.length > 0 && (
                      <div className="mb-6 space-y-3">
                        {streamingMessage.reasoning.map((step, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: i * 0.2 }}
                          >
                            <Reasoning>
                              <ScrambleIn delay={i * 200}>{step}</ScrambleIn>
                            </Reasoning>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {streamingMessage.content && (
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                          {streamingMessage.content}
                          <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse" />
                        </div>
                      </div>
                    )}
                  </Message>
                </motion.div>
              )}

              {isLoading && !streamingMessage && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-8"
                >
                  <Message role="assistant">
                    <Loader />
                  </Message>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions */}
            {showSuggestions && messages.length <= 2 && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8"
              >
                {suggestionPrompts.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.title}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  >
                    <PromptSuggestion
                      icon={<suggestion.icon className="w-5 h-5" />}
                      title={suggestion.title}
                      description={suggestion.description}
                      onClick={() => handleSuggestionClick(suggestion.prompt)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </ChatContainer>
        </div>
      </div>

      {/* Input */}
      <motion.div
        className="relative z-10 backdrop-blur-xl bg-black/30 border-t border-white/10 flex-shrink-0"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <PromptInput
            value={input}
            onValueChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder="Ask about GTM strategy, ambassadors, tracking links..."
            maxHeight={200}
          />
          <p className="text-xs text-gray-500 text-center mt-3">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
