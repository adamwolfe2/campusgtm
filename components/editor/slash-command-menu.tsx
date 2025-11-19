"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Sparkles,
  Table,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlashCommand {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: () => void;
  keywords?: string[];
}

interface SlashCommandMenuProps {
  items: SlashCommand[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  position?: { top: number; left: number };
  query?: string;
}

export function SlashCommandMenu({
  items,
  selectedIndex,
  onSelect,
  position,
  query = "",
}: SlashCommandMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    if (!query) {
      return items;
    }

    const lowerQuery = query.toLowerCase();
    return items.filter((item) => {
      const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
      const matchesKeywords =
        item.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(lowerQuery)
        ) ?? false;
      return matchesTitle || matchesKeywords;
    });
  }, [items, query]);

  // Scroll selected item into view
  React.useEffect(() => {
    const selectedElement = menuRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute z-50 w-72 rounded-lg border bg-popover p-1 shadow-lg"
        style={position}
        ref={menuRef}
      >
        <div className="max-h-[300px] overflow-y-auto">
          {filteredItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={item.title}
                onClick={() => onSelect(index)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    isSelected ? "bg-primary/10 text-primary" : "bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Default slash command items
 */
export function createDefaultSlashCommands(editor: {
  chain: () => {
    focus: () => {
      toggleHeading: (options: { level: number }) => { run: () => void };
      toggleBulletList: () => { run: () => void };
      toggleOrderedList: () => { run: () => void };
      toggleTaskList: () => { run: () => void };
      toggleBlockquote: () => { run: () => void };
      toggleCodeBlock: () => { run: () => void };
    };
  };
}): SlashCommand[] {
  return [
    {
      title: "Heading 1",
      description: "Big section heading",
      icon: Heading1,
      keywords: ["h1", "heading", "title"],
      command: () => {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: Heading2,
      keywords: ["h2", "heading", "subtitle"],
      command: () => {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      icon: Heading3,
      keywords: ["h3", "heading"],
      command: () => {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
      },
    },
    {
      title: "Bullet List",
      description: "Create a simple bullet list",
      icon: List,
      keywords: ["ul", "list", "bullet"],
      command: () => {
        editor.chain().focus().toggleBulletList().run();
      },
    },
    {
      title: "Numbered List",
      description: "Create a numbered list",
      icon: ListOrdered,
      keywords: ["ol", "list", "numbered", "ordered"],
      command: () => {
        editor.chain().focus().toggleOrderedList().run();
      },
    },
    {
      title: "Task List",
      description: "Track tasks with a checklist",
      icon: ListChecks,
      keywords: ["todo", "task", "checklist", "check"],
      command: () => {
        editor.chain().focus().toggleTaskList().run();
      },
    },
    {
      title: "Quote",
      description: "Capture a quote",
      icon: Quote,
      keywords: ["blockquote", "quote"],
      command: () => {
        editor.chain().focus().toggleBlockquote().run();
      },
    },
    {
      title: "Code Block",
      description: "Display code with syntax highlighting",
      icon: Code,
      keywords: ["code", "codeblock", "pre"],
      command: () => {
        editor.chain().focus().toggleCodeBlock().run();
      },
    },
    {
      title: "AI Generator",
      description: "Generate content with AI",
      icon: Sparkles,
      keywords: ["ai", "generate", "assistant", "gemini"],
      command: () => {
        // This will be implemented later with AI block
        console.log("AI Generator triggered");
      },
    },
  ];
}
