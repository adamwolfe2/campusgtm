# Prompt Kit AI Components

**Status:** ✅ Integrated
**Date:** November 21, 2025

---

## Overview

Campus GTM now includes **Prompt Kit** AI-native components alongside **coss ui** as the design system. This dual-component approach gives you:

- ✅ **coss ui** - Base UI primitives for all standard components (buttons, dialogs, forms, etc.)
- ✅ **Prompt Kit** - AI-specific components for chat, prompts, reasoning, and more

---

## Architecture

### Component Separation

```
components/
├── ui/              # coss ui (Base UI) - Main design system
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
│
└── prompt-kit/      # Prompt Kit - AI components only
    ├── prompt-input.tsx
    ├── chain-of-thought.tsx
    ├── reasoning.tsx
    ├── message.tsx
    └── ...
```

### Import Paths

```typescript
// coss ui (standard components)
import { Button, Dialog, Input } from "@/components/ui/button"

// Prompt Kit (AI components)
import { PromptInput } from "@/components/prompt-kit/prompt-input"
import { ChainOfThought } from "@/components/prompt-kit/chain-of-thought"

// Or use the alias (optional)
import { PromptInput } from "@/prompt/prompt-input"
```

---

## Available Components

### Core AI Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| **PromptInput** | AI-native textarea with actions | Chat input, prompt entry |
| **ChainOfThought** | Expandable reasoning steps | Show AI thinking process |
| **Reasoning** | Display AI reasoning | Explain decisions |
| **Message** | Chat message bubble | Conversations |
| **SystemMessage** | System-level messages | Status, errors |

### Additional Components

| Component | Description |
|-----------|-------------|
| **ChatContainer** | Container for chat UIs |
| **CodeBlock** | Syntax-highlighted code |
| **FileUpload** | AI-aware file upload |
| **Loader** | Loading states |
| **Markdown** | Markdown renderer |
| **PromptSuggestion** | Suggested prompts |
| **ResponseStream** | Streaming responses |
| **ScrollButton** | Auto-scroll control |
| **Source** | Citation/source display |
| **Steps** | Step-by-step process |
| **Tool** | Tool usage display |

---

## Usage Examples

### PromptInput

AI-native textarea with auto-resize and action buttons:

```tsx
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import { Send, Paperclip } from "lucide-react"

export function ChatInput() {
  const [value, setValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    // Send message...
    setIsLoading(false)
    setValue("")
  }

  return (
    <PromptInput
      value={value}
      onValueChange={setValue}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    >
      <PromptInputTextarea placeholder="Ask anything..." />
      <PromptInputActions>
        <PromptInputAction tooltip="Attach file">
          <Button variant="ghost" size="icon-sm">
            <Paperclip className="size-4" />
          </Button>
        </PromptInputAction>
        <PromptInputAction tooltip="Send message">
          <Button size="icon-sm" onClick={handleSubmit} disabled={isLoading}>
            <Send className="size-4" />
          </Button>
        </PromptInputAction>
      </PromptInputActions>
    </PromptInput>
  )
}
```

### ChainOfThought

Show AI reasoning steps with expandable sections:

```tsx
import {
  ChainOfThought,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
  ChainOfThoughtContent,
  ChainOfThoughtItem,
} from "@/components/prompt-kit/chain-of-thought"
import { Sparkles } from "lucide-react"

export function AIReasoning() {
  return (
    <ChainOfThought>
      <ChainOfThoughtStep defaultOpen>
        <ChainOfThoughtTrigger leftIcon={<Sparkles className="size-4" />}>
          Analyzing your request...
        </ChainOfThoughtTrigger>
        <ChainOfThoughtContent>
          <ChainOfThoughtItem>
            Breaking down the task into steps
          </ChainOfThoughtItem>
          <ChainOfThoughtItem>
            Identifying key information needed
          </ChainOfThoughtItem>
        </ChainOfThoughtContent>
      </ChainOfThoughtStep>

      <ChainOfThoughtStep>
        <ChainOfThoughtTrigger>
          Generating response...
        </ChainOfThoughtTrigger>
        <ChainOfThoughtContent>
          <ChainOfThoughtItem>
            Crafting personalized answer
          </ChainOfThoughtItem>
        </ChainOfThoughtContent>
      </ChainOfThoughtStep>
    </ChainOfThought>
  )
}
```

### Message

Chat message bubbles:

```tsx
import { Message } from "@/components/prompt-kit/message"
import { Avatar } from "@/components/ui/avatar"

export function ChatMessage({ role, content }) {
  return (
    <Message
      avatar={<Avatar name={role === "user" ? "You" : "AI"} />}
      isUser={role === "user"}
    >
      {content}
    </Message>
  )
}
```

### Reasoning

Display AI reasoning inline:

```tsx
import { Reasoning } from "@/components/prompt-kit/reasoning"

export function AIExplanation() {
  return (
    <Reasoning>
      Based on the data provided, I identified three key trends:
      1. Student engagement is highest on Tuesdays
      2. Social media reach peaks at 7 PM
      3. Campus events drive 40% more signups
    </Reasoning>
  )
}
```

---

## Component Composition

Prompt Kit components work seamlessly with coss ui:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PromptInput, PromptInputTextarea } from "@/components/prompt-kit/prompt-input"

export function AIChatDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat with AI</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Messages go here */}
        </div>

        <PromptInput>
          <PromptInputTextarea placeholder="Type your message..." />
        </PromptInput>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Styling

Prompt Kit components automatically use:
- ✅ coss ui design tokens (colors, spacing, etc.)
- ✅ Tailwind CSS v4 utilities
- ✅ Dark mode support
- ✅ Consistent typography

No additional styling configuration needed!

---

## Dependencies

Already installed in `package.json`:

```json
{
  "cmdk": "^1.1.1",       // Command palette primitives
  "sonner": "^2.0.7",     // Toast notifications
  "vaul": "^1.1.2"        // Drawer/modal primitives
}
```

---

## Best Practices

### When to Use Prompt Kit

✅ **Use Prompt Kit for:**
- Chat interfaces
- AI reasoning displays
- Prompt input fields
- Streaming responses
- AI-specific interactions

❌ **Don't use Prompt Kit for:**
- Standard forms (use coss ui Input)
- Basic buttons (use coss ui Button)
- Regular dialogs (use coss ui Dialog)
- General UI components

### Composition Pattern

Always use coss ui for layout and standard controls:

```tsx
// ✅ Good: coss ui for structure, Prompt Kit for AI features
<Card>                              {/* coss ui */}
  <CardHeader>                      {/* coss ui */}
    <CardTitle>AI Assistant</CardTitle>
  </CardHeader>
  <CardContent>                     {/* coss ui */}
    <ChainOfThought>               {/* Prompt Kit */}
      {/* AI reasoning */}
    </ChainOfThought>
  </CardContent>
</Card>

// ❌ Bad: Mixing component types for same purpose
<PromptKitCard>  {/* Don't use if it existed */}
  <Button>       {/* Inconsistent */}
</PromptKitCard>
```

---

## TypeScript Support

All components are fully typed:

```typescript
import type {
  PromptInputProps,
  ChainOfThoughtProps,
  MessageProps,
} from "@/components/prompt-kit/..."

// Full IntelliSense support
const props: PromptInputProps = {
  value: "",
  onValueChange: (v) => console.log(v),
  isLoading: false,
  // ...
}
```

---

## Examples in the Codebase

See these files for real-world usage:

- `components/chat-input.tsx` - AI chat input
- `components/floating-chat-bar.tsx` - Floating chat UI
- `app/chat/page.tsx` - Full chat interface

---

## Migration from Other Libraries

### From shadcn/ui Textarea

**Before:**
```tsx
<Textarea placeholder="Enter text..." value={value} onChange={e => setValue(e.target.value)} />
```

**After (for AI input):**
```tsx
<PromptInput value={value} onValueChange={setValue}>
  <PromptInputTextarea placeholder="Ask anything..." />
</PromptInput>
```

---

## Resources

- **Prompt Kit Docs:** https://prompt-kit.com/docs
- **GitHub Repo:** https://github.com/ibelick/prompt-kit
- **Component Examples:** /components/prompt-kit/*.tsx

---

## Contributing

When adding new AI features:

1. ✅ Use Prompt Kit for AI-specific UI
2. ✅ Use coss ui for standard components
3. ✅ Keep components in separate namespaces
4. ✅ Follow composition patterns above
5. ✅ Document new patterns here

---

**Maintained by:** Campus GTM Team
**Last Updated:** November 21, 2025
