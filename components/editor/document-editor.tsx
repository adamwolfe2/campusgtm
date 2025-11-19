"use client";

import * as React from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Suggestion } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { SlashCommandMenu, createDefaultSlashCommands, type SlashCommand } from "./slash-command-menu";
import { cn } from "@/lib/utils";

interface DocumentEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function DocumentEditor({
  content = "",
  onChange,
  placeholder = "Type '/' for commands...",
  editable = true,
  className,
}: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-muted rounded-md p-4 font-mono text-sm",
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 hover:text-primary/80",
        },
      }),
      Underline,
      SlashCommandExtension,
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none",
          "prose-headings:font-bold prose-headings:tracking-tight",
          "prose-h1:text-4xl prose-h1:mt-6 prose-h1:mb-4",
          "prose-h2:text-3xl prose-h2:mt-5 prose-h2:mb-3",
          "prose-h3:text-2xl prose-h3:mt-4 prose-h3:mb-2",
          "prose-p:my-3 prose-p:leading-7",
          "prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6",
          "prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6",
          "prose-li:my-1",
          "prose-blockquote:border-l-4 prose-blockquote:border-muted prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4",
          "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-pre:bg-muted prose-pre:rounded-md prose-pre:p-4"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  return (
    <div
      className={cn(
        "w-full rounded-lg border bg-background p-8",
        !editable && "cursor-default",
        className
      )}
    >
      <EditorContent editor={editor} />
    </div>
  );
}

/**
 * Slash Command Extension
 * Implements the "/" command menu using Tiptap suggestion
 */
const SlashCommandExtension = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        startOfLine: false,

        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },

        items: ({ query }) => {
          const commands = createDefaultSlashCommands(this.editor);

          if (!query) {
            return commands;
          }

          const lowerQuery = query.toLowerCase();
          return commands.filter((item) => {
            const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
            const matchesKeywords =
              item.keywords?.some((keyword) =>
                keyword.toLowerCase().includes(lowerQuery)
              ) ?? false;
            return matchesTitle || matchesKeywords;
          });
        },

        render: () => {
          let component: ReactRenderer | null = null;
          let popup: TippyInstance[] | null = null;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandMenuComponent, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate(props) {
              component?.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              });
            },

            onKeyDown(props) {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }

              return (component?.ref as SlashCommandMenuComponentHandle)?.onKeyDown(props) ?? false;
            },

            onExit() {
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});

/**
 * Component wrapper for slash command menu
 */
interface SlashCommandMenuComponentProps {
  items: SlashCommand[];
  command: (item: { editor: unknown; range: unknown }) => void;
  editor: unknown;
  range: unknown;
}

interface SlashCommandMenuComponentHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const SlashCommandMenuComponent = React.forwardRef<
  SlashCommandMenuComponentHandle,
  SlashCommandMenuComponentProps
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ editor: props.editor, range: props.range });
      item.command();
    }
  };

  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) =>
          prev <= 0 ? props.items.length - 1 : prev - 1
        );
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) =>
          prev >= props.items.length - 1 ? 0 : prev + 1
        );
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  return (
    <SlashCommandMenu
      items={props.items}
      selectedIndex={selectedIndex}
      onSelect={selectItem}
    />
  );
});

SlashCommandMenuComponent.displayName = "SlashCommandMenuComponent";
