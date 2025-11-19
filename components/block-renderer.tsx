"use client";

import * as React from "react";
import type { Block } from "@/types";
import { BlockType } from "@/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface BlockRendererProps {
  block: Block;
  className?: string;
  editable?: boolean;
  onUpdate?: (blockId: string, content: string) => void;
}

/**
 * Renders a single block based on its type
 * Notion-style block rendering
 */
export function BlockRenderer({
  block,
  className,
  editable = false,
  onUpdate,
}: BlockRendererProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState(block.content);

  const handleSave = () => {
    if (content !== block.content) {
      onUpdate?.(block.id, content);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setContent(block.content);
      setIsEditing(false);
    }
  };

  const baseClass = cn("my-2", className);

  // If editable and editing, show input
  if (editable && isEditing) {
    return (
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full rounded border border-primary bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
      />
    );
  }

  // Render based on block type
  switch (block.type) {
    case BlockType.HEADING_1:
      return (
        <h1
          className={cn("text-4xl font-bold mt-6 mb-4", baseClass)}
          onClick={() => editable && setIsEditing(true)}
        >
          {block.content}
        </h1>
      );

    case BlockType.HEADING_2:
      return (
        <h2
          className={cn("text-3xl font-bold mt-5 mb-3", baseClass)}
          onClick={() => editable && setIsEditing(true)}
        >
          {block.content}
        </h2>
      );

    case BlockType.HEADING_3:
      return (
        <h3
          className={cn("text-2xl font-bold mt-4 mb-2", baseClass)}
          onClick={() => editable && setIsEditing(true)}
        >
          {block.content}
        </h3>
      );

    case BlockType.TEXT:
      return (
        <p
          className={cn("leading-7", baseClass)}
          onClick={() => editable && setIsEditing(true)}
        >
          {block.content}
        </p>
      );

    case BlockType.BULLET_LIST:
      return (
        <li
          className={cn("ml-6 list-disc", baseClass)}
          onClick={() => editable && setIsEditing(true)}
        >
          {block.content}
        </li>
      );

    case BlockType.CHECKLIST:
      return (
        <div
          className={cn("flex items-start gap-2", baseClass)}
          onClick={() => editable && setIsEditing(true)}
        >
          <div
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
              block.metadata?.checked
                ? "border-primary bg-primary"
                : "border-muted-foreground"
            )}
          >
            {block.metadata?.checked && (
              <Check className="h-3 w-3 text-primary-foreground" />
            )}
          </div>
          <span className={block.metadata?.checked ? "line-through text-muted-foreground" : ""}>
            {block.content}
          </span>
        </div>
      );

    case BlockType.QUOTE:
      return (
        <blockquote
          className={cn(
            "border-l-4 border-muted pl-4 italic my-4",
            baseClass
          )}
          onClick={() => editable && setIsEditing(true)}
        >
          {block.content}
        </blockquote>
      );

    case BlockType.AI_BLOCK:
      return (
        <div className={cn("rounded-lg bg-primary/10 p-4 my-4", baseClass)}>
          <p className="text-sm text-muted-foreground">AI Generated:</p>
          <p className="mt-2">{block.content}</p>
        </div>
      );

    default:
      return <p className={baseClass}>{block.content}</p>;
  }
}

/**
 * Renders a list of blocks
 */
interface BlockListRendererProps {
  blocks: Block[];
  className?: string;
  editable?: boolean;
  onUpdateBlock?: (blockId: string, content: string) => void;
}

export function BlockListRenderer({
  blocks,
  className,
  editable,
  onUpdateBlock,
}: BlockListRendererProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          editable={editable}
          onUpdate={onUpdateBlock}
        />
      ))}
    </div>
  );
}
