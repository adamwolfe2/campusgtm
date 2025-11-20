"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ChatInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  Plus,
} from "lucide-react";
import { glass, animations, gradients } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial prompt from URL
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      handleChatSubmit(initialPrompt);
    }
  }, [initialPrompt]);

  // Handle chat submission with streaming
  const handleChatSubmit = async (message: string) => {
    if (!message.trim() || isChatLoading) return;

    setIsChatLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get response');
      }

      // Handle streaming response from AI SDK
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // Create assistant message
      const assistantMessageId = (Date.now() + 1).toString();
      let assistantContent = "";

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
        },
      ]);

      // Read AI SDK text stream format
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // For text stream, just append the decoded text
        assistantContent += decoder.decode(value, { stream: false });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantContent }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('[Chat] Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Background gradient */}
      <div className={cn("fixed inset-0 -z-10", gradients.subtle)} />

      {/* Top Navigation */}
      <motion.nav
        {...animations.fadeInDown}
        className={cn(
          "sticky top-0 z-50 border-b",
          glass.strong
        )}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-semibold">New Chat</h1>
                <p className="text-xs text-muted-foreground">
                  {messages.length > 0 ? `${Math.floor(messages.length / 2)} messages` : 'Ask anything about GTM strategy'}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMessages([]);
              setInput("");
            }}
            className={glass.card}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </motion.nav>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-32 pt-8"
      >
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.length === 0 && (
            <motion.div
              {...animations.fadeInUp}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mb-3 text-3xl font-bold">
                Your AI GTM Copilot
              </h2>
              <p className="max-w-md text-muted-foreground">
                Ask me anything about go-to-market strategy, student ambassador programs, content planning, and more.
              </p>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              {...animations.fadeInUp}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex gap-4",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-5 py-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                  {message.role === "assistant" && message.content === "" && (
                    <Loader2 className="h-4 w-4 animate-spin inline-block" />
                  )}
                </p>
              </div>

              {message.role === "user" && user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="User"
                  className="h-10 w-10 shrink-0 rounded-xl object-cover"
                />
              )}
            </motion.div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Chat Input at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <ChatInput
            onSubmit={handleChatSubmit}
            isLoading={isChatLoading}
            size="large"
            showIcon={true}
            value={input}
            onChange={setInput}
            placeholder="Ask anything about GTM strategy..."
          />
        </div>
      </div>
    </div>
  );
}
