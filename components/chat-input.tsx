"use client";

import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { glass, animations } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (message: string) => void | Promise<void>;
  placeholder?: string;
  isLoading?: boolean;
  size?: "default" | "large";
  showIcon?: boolean;
  className?: string;
}

export function ChatInput({
  onSubmit,
  placeholder = "Ask anything about GTM strategy...",
  isLoading = false,
  size = "default",
  showIcon = true,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || isLoading) return;

    const currentMessage = message;
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await onSubmit(currentMessage);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <motion.form
      {...animations.fadeInUp}
      onSubmit={handleSubmit}
      className={cn(
        "relative w-full",
        size === "large" ? "max-w-4xl" : "max-w-2xl",
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-end gap-2 rounded-2xl p-2",
          glass.input,
          "shadow-lg"
        )}
      >
        {/* Icon */}
        {showIcon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        )}

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent px-0 py-3 text-base",
            "placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
            size === "large" && "text-lg"
          )}
          rows={1}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isLoading}
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl",
            !message.trim() && "opacity-50"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Hint text */}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Press <kbd className="rounded bg-muted px-1.5 py-0.5">Enter</kbd> to send,{" "}
        <kbd className="rounded bg-muted px-1.5 py-0.5">Shift + Enter</kbd> for new line
      </p>
    </motion.form>
  );
}
