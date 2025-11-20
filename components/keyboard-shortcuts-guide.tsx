/**
 * Keyboard Shortcuts Guide
 * Shows all available keyboard shortcuts
 * Triggered by pressing "?" key
 */

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Command, Search, MessageSquare, Plus, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "General",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close dialogs/modals" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["⌘", "N"], description: "New strategy workspace" },
      { keys: ["⌘", "C"], description: "Open AI chat" },
      { keys: ["G", "D"], description: "Go to dashboard" },
      { keys: ["G", "W"], description: "Go to workspaces" },
      { keys: ["G", "S"], description: "Go to settings" },
    ],
  },
  {
    title: "Editor",
    shortcuts: [
      { keys: ["⌘", "Z"], description: "Undo" },
      { keys: ["⌘", "⇧", "Z"], description: "Redo" },
      { keys: ["⌘", "B"], description: "Bold" },
      { keys: ["⌘", "I"], description: "Italic" },
      { keys: ["⌘", "E"], description: "Code" },
      { keys: ["/"], description: "Open slash command menu" },
      { keys: ["Enter"], description: "Submit / Next question" },
    ],
  },
];

function KeyboardKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm min-w-[1.75rem]">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsGuide() {
  const [open, setOpen] = React.useState(false);

  // Toggle shortcuts guide with "?" key
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Only trigger if not in an input field
      if (
        e.key === "?" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Speed up your workflow with these shortcuts
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <KeyboardKey>{key}</KeyboardKey>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs mx-0.5">
                              +
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 shrink-0">
              <KeyboardKey>⌘</KeyboardKey>
              <span className="text-xs">on Mac</span>
            </div>
            <div className="flex items-center gap-1">
              <KeyboardKey>Ctrl</KeyboardKey>
              <span className="text-xs">on Windows/Linux</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
