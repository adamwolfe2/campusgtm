"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { glass, promptThemes, animations } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface SuggestedPrompt {
  id: string;
  text: string;
  category: keyof typeof promptThemes;
}

interface SuggestedPromptsProps {
  prompts: SuggestedPrompt[];
  onSelect: (prompt: string) => void;
  className?: string;
}

const DEFAULT_PROMPTS: SuggestedPrompt[] = [
  {
    id: "1",
    text: "Write a viral LinkedIn post for my SaaS product",
    category: "content",
  },
  {
    id: "2",
    text: "Create a 3-tier student ambassador program structure",
    category: "strategy",
  },
  {
    id: "3",
    text: "Generate cold email templates for YC founders",
    category: "outreach",
  },
  {
    id: "4",
    text: "How do I break into the university hackathon market?",
    category: "growth",
  },
  {
    id: "5",
    text: "Analyze my ICP and suggest distribution channels",
    category: "analysis",
  },
  {
    id: "6",
    text: "Create a 4-week content calendar for Gen Z audience",
    category: "content",
  },
];

export function SuggestedPrompts({
  prompts = DEFAULT_PROMPTS,
  onSelect,
  className,
}: SuggestedPromptsProps) {
  return (
    <div className={cn("w-full max-w-4xl", className)}>
      <motion.div {...animations.fadeInUp} transition={{ delay: 0.1 }}>
        <h3 className="mb-4 text-center text-sm font-medium text-muted-foreground">
          Suggested Prompts
        </h3>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt, index) => {
          const theme = promptThemes[prompt.category];
          return (
            <motion.div
              key={prompt.id}
              {...animations.fadeInUp}
              transition={{ delay: 0.15 + index * 0.05 }}
            >
              <Card
                className={cn(
                  "group cursor-pointer p-4 transition-all duration-300",
                  glass.card,
                  glass.hover
                )}
                onClick={() => onSelect(prompt.text)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg",
                      theme.bg
                    )}
                  >
                    {theme.icon}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 group-hover:text-foreground">
                    {prompt.text}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export { DEFAULT_PROMPTS };
