"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ChatInput } from "@/components/chat-input";
import { SuggestedPrompts, DEFAULT_PROMPTS } from "@/components/suggested-prompts";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Clock,
  FileText,
  ArrowRight,
  Loader2,
  Plus,
  Building2,
} from "lucide-react";
import { getWorkspaces, type WorkspaceWithModules } from "@/lib/database/workspace-service";
import { glass, animations, gradients } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithModules[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setIsLoading(true);
        const loadedWorkspaces = await getWorkspaces(user?.id);
        setWorkspaces(loadedWorkspaces);
      } catch (err) {
        console.error("Failed to load workspaces:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load workspaces"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaces();
  }, [user?.id]);

  // Handle prompt selection - populate input
  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
  };

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

      // Read AI SDK data stream format
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          // AI SDK sends lines prefixed with numbers like "0:" for text chunks
          if (line.startsWith('0:')) {
            try {
              const data = line.slice(2);
              assistantContent += data;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Chat] Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* Background gradient */}
      <div className={cn("fixed inset-0 -z-10", gradients.subtle)} />

      {/* Top Navigation - Floating */}
      <motion.nav
        {...animations.fadeInDown}
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4"
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-semibold">Campus GTM</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/workspaces")}>
            Workspaces
          </Button>
          <NotificationsDropdown />
          <UserProfileDropdown />
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex min-h-screen flex-col items-center justify-start px-4 pb-24 pt-32">
        {/* Hero Section */}
        <motion.div
          {...animations.fadeInUp}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
            Your AI-Powered
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              GTM Copilot
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Ask anything about go-to-market strategy, get instant answers
          </p>
        </motion.div>

        {/* Main Chat Input */}
        <ChatInput
          onSubmit={handleChatSubmit}
          isLoading={isChatLoading}
          size="large"
          showIcon={true}
          value={input}
          onChange={setInput}
          className="mb-12"
        />

        {/* Suggested Prompts */}
        <SuggestedPrompts
          prompts={DEFAULT_PROMPTS}
          onSelect={handlePromptSelect}
          className="mb-16"
        />

        {/* Chat Messages - Show conversation history */}
        {messages.length > 0 && (
          <motion.div
            {...animations.fadeInUp}
            className="w-full max-w-4xl mb-16"
          >
            <Card className={cn(glass.card, "p-6")}>
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    {...animations.fadeInUp}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex gap-4",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : cn(glass.subtle, "border")
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Workspaces Section */}
        {!isLoading && workspaces.length > 0 && (
          <motion.div
            {...animations.fadeInUp}
            transition={{ delay: 0.3 }}
            className="w-full max-w-6xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Workspaces</h2>
                <p className="text-sm text-muted-foreground">
                  Continue working on your GTM strategies
                </p>
              </div>
              <Button
                onClick={() => router.push("/onboarding")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Strategy
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspaces.slice(0, 6).map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  {...animations.fadeInUp}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "group cursor-pointer transition-all duration-300",
                      glass.card,
                      glass.hover
                    )}
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                      <CardTitle className="mt-4 line-clamp-1">
                        {workspace.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {workspace.companyName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{workspace.modules.length} modules</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {workspace.updatedAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {workspaces.length > 6 && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => router.push("/workspaces")}
                  className={glass.card}
                >
                  View All Workspaces ({workspaces.length})
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            {...animations.fadeInUp}
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        )}

        {/* Empty State - No Workspaces */}
        {!isLoading && workspaces.length === 0 && (
          <motion.div
            {...animations.fadeInUp}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className={cn("border-dashed", glass.card)}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Start Your First Strategy</CardTitle>
                <CardDescription>
                  Create a workspace and let AI build your GTM plan
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button
                  onClick={() => router.push("/onboarding")}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
