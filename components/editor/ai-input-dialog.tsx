"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AIInputDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (prompt: string) => void;
    position?: { top: number; left: number };
}

export function AIInputDialog({
    isOpen,
    onClose,
    onSubmit,
    position,
}: AIInputDialogProps) {
    const [prompt, setPrompt] = React.useState("");
    const [isGenerating, setIsGenerating] = React.useState(false);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } else {
            setPrompt("");
            setIsGenerating(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!prompt.trim()) return;

        setIsGenerating(true);
        await onSubmit(prompt);
        // Don't close immediately, let parent handle state based on streaming
        setPrompt("");
        setIsGenerating(false);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === "Escape") {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[1px]"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed z-[9999] w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-2xl"
                        style={
                            position
                                ? {
                                    top: position.top,
                                    left: Math.max(16, position.left - 200), // Center roughly relative to cursor but keep on screen
                                }
                                : {
                                    top: "20%",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                }
                        }
                    >
                        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm font-medium">Ask AI to write...</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-6 w-6 rounded-full"
                                onClick={onClose}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <div className="p-4">
                            <textarea
                                ref={inputRef}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Describe what you want to generate (e.g., 'A section about market sizing for a SaaS product')..."
                                className="h-24 w-full resize-none rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    Press <kbd className="font-sans">Enter</kbd> to generate
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClose}
                                        disabled={isGenerating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSubmit()}
                                        disabled={!prompt.trim() || isGenerating}
                                        className="gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-3.5 w-3.5" />
                                                Generate
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
