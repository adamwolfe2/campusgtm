# Campus GTM UI Libraries - Comprehensive Analysis

**Last Updated:** November 21, 2025
**Author:** Claude Code
**Purpose:** Complete guide to using coss ui, Prompt Kit, and Fancy Components together

---

## Executive Summary

Campus GTM now integrates **three complementary UI libraries**, each serving a distinct purpose:

1. **coss ui** - Base UI foundation (50+ components)
2. **Prompt Kit** - AI-native interface components (18 components)
3. **Fancy Components** - Motion-based animations & micro-interactions (45 components)

This multi-library approach provides:
- **Solid foundation** from coss ui's accessible Base UI primitives
- **AI-first UX** with Prompt Kit's specialized components
- **Delightful animations** via Fancy Components' motion library

---

## Library Comparison Matrix

| Aspect | coss ui | Prompt Kit | Fancy Components |
|--------|---------|------------|------------------|
| **Foundation** | Base UI (MUI) | Headless components | Motion library |
| **Primary Use** | Standard UI elements | AI interactions | Animations & effects |
| **Styling** | Tailwind CSS v4 | Tailwind CSS | Tailwind CSS v4 |
| **Component Count** | 50+ | 18 | 45 |
| **Animation Library** | CSS transitions | Minimal motion | motion (v12.23.24) |
| **Accessibility** | ✅ Full ARIA support | ✅ Semantic HTML | ⚠️ Motion-sensitive |
| **Bundle Impact** | Medium | Small | Large (motion + physics) |
| **Learning Curve** | Low | Low | Medium |

---

## 1. coss ui - Design System Foundation

**Location:** `components/ui/`
**Import Path:** `@/components/ui/*`
**Framework:** Base UI (MUI)
**Documentation:** [COSS_UI_MIGRATION.md](./COSS_UI_MIGRATION.md)

### When to Use coss ui

✅ **Use for:**
- Form elements (inputs, selects, checkboxes, radio buttons)
- Navigation (menus, tabs, breadcrumbs)
- Layout components (cards, separators, containers)
- Overlays (dialogs, popovers, tooltips, alerts)
- Data display (tables, badges, avatars)
- Standard interactive elements (buttons, switches)

❌ **Don't use for:**
- AI chat interfaces → Use Prompt Kit
- Complex animations → Use Fancy Components
- Text effects → Use Fancy Components

### Component Categories (50+ components)

**Form Controls:**
- `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`
- `autocomplete`, `combobox`, `slider`, `number-input`

**Navigation:**
- `menu`, `dropdown-menu`, `tabs`, `breadcrumb`, `navigation-menu`

**Overlays:**
- `dialog`, `alert-dialog`, `popover`, `tooltip`, `sheet`, `drawer`

**Data Display:**
- `table`, `card`, `badge`, `avatar`, `separator`, `divider`

**Feedback:**
- `alert`, `toast`, `spinner`, `progress`, `skeleton`

**Layout:**
- `accordion`, `collapsible`, `scroll-area`, `resizable`, `aspect-ratio`

### Example Usage

```tsx
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function StandardForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Form</Button>
      </DialogTrigger>
      <DialogContent>
        <Input placeholder="Enter your name" />
        <Button>Submit</Button>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 2. Prompt Kit - AI-Native Components

**Location:** `components/prompt-kit/`
**Import Path:** `@/prompt/*`
**Framework:** Headless React components
**Documentation:** [PROMPT_KIT_INTEGRATION.md](./PROMPT_KIT_INTEGRATION.md)

### When to Use Prompt Kit

✅ **Use for:**
- AI chat interfaces and message displays
- Prompt input with auto-resize and actions
- Reasoning step displays (chain-of-thought)
- Code blocks with syntax highlighting
- Streaming AI responses
- File uploads for AI processing
- Tool/function call displays
- System messages and prompts

❌ **Don't use for:**
- Standard forms → Use coss ui
- Navigation menus → Use coss ui
- Decorative animations → Use Fancy Components

### Component Categories (18 components)

**Input Components:**
- `prompt-input` - Auto-resizing textarea with action buttons
- `file-upload` - Drag-and-drop file upload for AI
- `prompt-suggestion` - Clickable prompt suggestions

**Display Components:**
- `message` - AI/user message bubbles
- `system-message` - System notifications
- `chat-container` - Scrollable chat layout
- `response-stream` - Streaming text display

**AI-Specific:**
- `chain-of-thought` - Collapsible reasoning steps
- `reasoning` - Individual reasoning step
- `tool` - Function/tool call display
- `steps` - Multi-step process indicator

**Content:**
- `code-block` - Syntax-highlighted code with copy
- `markdown` - Markdown renderer
- `image` - Image display with loading states
- `jsx-preview` - Live JSX preview
- `source` - Source attribution display

**UI Utilities:**
- `loader` - Loading spinner
- `scroll-button` - Auto-scroll to bottom

### Example Usage

```tsx
import { PromptInput, PromptInputForm, PromptInputTextarea } from "@/prompt/prompt-input"
import { ChainOfThought, Reasoning } from "@/prompt/chain-of-thought"
import { Message } from "@/prompt/message"

export function AIChat() {
  return (
    <div>
      <Message role="assistant">
        <ChainOfThought>
          <Reasoning>Analyzing the user's request...</Reasoning>
          <Reasoning>Searching the codebase...</Reasoning>
        </ChainOfThought>
        <p>Here's what I found:</p>
      </Message>

      <PromptInput>
        <PromptInputForm>
          <PromptInputTextarea placeholder="Ask me anything..." />
        </PromptInputForm>
      </PromptInput>
    </div>
  )
}
```

---

## 3. Fancy Components - Animation & Micro-interactions

**Location:** `components/fancy/`
**Import Paths:** `@/fancy/*` or `@/hooks/fancy/*`
**Framework:** Motion (v12.23.24)
**Repository:** https://github.com/danielpetho/fancy

### When to Use Fancy Components

✅ **Use for:**
- Text animations and effects
- Hover interactions and micro-interactions
- Scroll-based animations
- Cursor-responsive effects
- Physics-based animations (gravity, elastic)
- Background animations and gradients
- Image effects (parallax, trails)
- Carousel and marquee components
- SVG path animations
- Variable font animations

❌ **Don't use for:**
- Static content → Use coss ui
- Forms and inputs → Use coss ui
- AI interfaces → Use Prompt Kit

### Component Categories (45 components)

#### **Text Effects (24 components)**
Located in: `components/fancy/text/`

**Typing Effects:**
- `typewriter` - Classic typewriter animation
- `scramble-hover` - Text scrambles on hover
- `scramble-in` - Text scrambles in on mount

**Letter Swapping:**
- `letter-swap-forward-anim` - Letters swap in sequence
- `letter-swap-pingpong-anim` - Letters swap back and forth
- `random-letter-swap-forward-anim` - Random letter swapping
- `random-letter-swap-pingpong-anim` - Random pingpong swapping
- `letter-3d-swap` - 3D letter swap effect

**Underline Animations:**
- `underline-center` - Underline expands from center
- `underline-comes-in-goes-out` - Underline slides in/out
- `underline-goes-out-comes-in` - Reverse underline animation
- `underline-to-background` - Underline becomes background

**Text Transformations:**
- `text-rotate` - Rotating text animation
- `breathing-text` - Pulsing breathing effect
- `text-cursor-proximity` - Text reacts to cursor
- `text-highlighter` - Highlight text on scroll
- `scroll-and-swap-text` - Text changes on scroll
- `vertical-cut-reveal` - Vertical reveal animation

**Variable Fonts:**
- `variable-font-and-cursor` - Font weight follows cursor
- `variable-font-cursor-proximity` - Weight changes near cursor
- `variable-font-hover-by-letter` - Per-letter hover weight
- `variable-font-hover-by-random-letter` - Random letter weight

**Path & Numbers:**
- `text-along-path` - Text follows SVG path
- `basic-number-ticker` - Animated number counter

#### **Block Components (11 components)**
Located in: `components/fancy/blocks/`

**Layout & Motion:**
- `float` - Smooth 3D floating animation
- `drag-elements` - Draggable elements
- `circling-elements` - Elements orbit in circle
- `stacking-cards` - Cards stack on scroll

**Marquees & Carousels:**
- `simple-marquee` - Basic scrolling marquee
- `marquee-along-svg-path` - Marquee follows SVG path
- `simple-carousel` - Basic carousel component

**SVG & Paths:**
- `element-along-svg-path` - Element follows SVG path
- `css-box` - CSS-styled box animations

**Special Effects:**
- `media-between-text` - Media interleaved with text
- `screensaver` - Bouncing screensaver effect

#### **Background Effects (2 components)**
Located in: `components/fancy/background/`

- `animated-gradient-with-svg` - Animated SVG gradient backgrounds
- `pixel-trail` - Pixelated cursor trail effect

#### **Physics Simulations (3 components)**
Located in: `components/fancy/physics/`

- `gravity` - Gravity physics simulation (Matter.js)
- `cursor-attractor-and-gravity` - Cursor attracts/repels elements
- `elastic-line` - Elastic line that follows cursor

#### **Image Effects (2 components)**
Located in: `components/fancy/image/`

- `parallax-floating` - Parallax floating images
- `image-trail` - Trail of images following cursor

#### **Carousels (1 component)**
Located in: `components/fancy/carousel/`

- `box-carousel` - 3D box carousel

#### **SVG Filters (2 components)**
Located in: `components/fancy/filter/`

- `gooey-svg-filter` - Gooey blob effect
- `pixelate-svg-filter` - Pixelation effect

### Example Usage

```tsx
import ScrambleHover from "@/fancy/text/scramble-hover"
import Float from "@/fancy/blocks/float"
import Typewriter from "@/fancy/text/typewriter"

export function AnimatedHero() {
  return (
    <div>
      <Float speed={0.5} amplitude={[10, 30, 30]}>
        <h1>
          <ScrambleHover text="Campus GTM" scrambleSpeed={50} />
        </h1>
      </Float>

      <Typewriter
        text={["Track your links", "Grow your campus", "Build your empire"]}
        speed={50}
        loop={true}
      />
    </div>
  )
}
```

### Fancy Components Hooks (11 hooks)
Located in: `hooks/fancy/`

- `use-debounced-dimensions` - Debounced element size
- `use-detect-browser` - Browser detection
- `use-dimensions` - Element dimensions tracking
- `use-elastic-line-events` - Elastic line physics
- `use-line-breakdown` - Text line breakdown
- `use-line-count` - Count text lines
- `use-mounted` - Component mount state
- `use-mouse-position-ref` - Mouse position with ref
- `use-mouse-position` - Mouse position tracking
- `use-mouse-vector` - Mouse velocity vector
- `use-screen-size` - Screen size detection

---

## Dependencies & Installation

### Core Dependencies

```json
{
  "dependencies": {
    "@base-ui-components/react": "^1.0.0-beta.4",
    "motion": "^12.23.24",
    "tailwindcss": "^4.1.17",
    "cmdk": "^1.0.0",
    "sonner": "^1.5.0",
    "vaul": "^1.0.0",
    "flubber": "^0.4.2",
    "lenis": "^1.1.20",
    "matter-js": "^0.20.0",
    "poly-decomp": "^0.3.0",
    "svg-path-commander": "^2.1.6"
  }
}
```

### Import Paths Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/prompt/*": ["./components/prompt-kit/*"],
      "@/fancy/*": ["./components/fancy/*"],
      "@/hooks/fancy/*": ["./hooks/fancy/*"]
    }
  }
}
```

---

## Design Philosophy

### Component Selection Decision Tree

```
Need a component?
│
├─ Is it an AI interaction?
│  └─ YES → Use Prompt Kit
│     Examples: chat, reasoning, prompts, code display
│
├─ Is it a decorative animation or text effect?
│  └─ YES → Use Fancy Components
│     Examples: hover effects, scroll animations, physics
│
└─ Is it a standard UI element?
   └─ YES → Use coss ui
      Examples: buttons, forms, dialogs, menus
```

### Combining Libraries

**✅ DO:**
- Use coss ui Buttons with Fancy text effects
- Wrap Prompt Kit messages in Fancy animations
- Use coss ui layouts with Fancy background effects
- Combine coss ui dialogs with Fancy entrance animations

**❌ DON'T:**
- Use multiple animation libraries for the same effect
- Duplicate functionality across libraries
- Create overly complex nested animations
- Use Fancy physics in production-critical paths (performance)

### Example: Combined Usage

```tsx
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PromptInput } from "@/prompt/prompt-input"
import ScrambleHover from "@/fancy/text/scramble-hover"
import Float from "@/fancy/blocks/float"

export function HybridComponent() {
  return (
    <Dialog>
      <DialogContent>
        {/* coss ui for structure */}
        <div className="space-y-4">
          {/* Fancy for text effect */}
          <h2>
            <ScrambleHover text="AI Chat" />
          </h2>

          {/* Prompt Kit for AI interface */}
          <PromptInput placeholder="Ask anything..." />

          {/* Fancy for button animation */}
          <Float amplitude={[0, 5, 0]}>
            <Button>Submit</Button>
          </Float>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Performance Considerations

### Bundle Size Impact

| Library | Approximate Size | Tree-Shakeable |
|---------|-----------------|----------------|
| coss ui | ~150KB (full) | ✅ Yes |
| Prompt Kit | ~30KB | ✅ Yes |
| Fancy Components | ~200KB (with motion) | ⚠️ Partial |

### Optimization Strategies

1. **Lazy Load Fancy Components**
   ```tsx
   const Float = dynamic(() => import("@/fancy/blocks/float"), {
     ssr: false,
     loading: () => <div>Loading...</div>
   })
   ```

2. **Use CSS Animations When Possible**
   - Prefer coss ui's CSS transitions for simple animations
   - Reserve Fancy Components for complex interactions

3. **Avoid Physics on Mobile**
   ```tsx
   const isMobile = useMediaQuery("(max-width: 768px)")

   return isMobile ? (
     <div>{children}</div>
   ) : (
     <Gravity>{children}</Gravity>
   )
   ```

4. **Reduce Motion for Accessibility**
   ```tsx
   const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

   if (prefersReducedMotion) {
     return <div>{children}</div>
   }
   ```

---

## Accessibility Guidelines

### Motion Accessibility

Always respect `prefers-reduced-motion`:

```tsx
import { useMediaQuery } from "@/hooks/use-media-query"

export function AccessibleAnimation({ children }) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  if (prefersReducedMotion) {
    return <div>{children}</div>
  }

  return <Float>{children}</Float>
}
```

### ARIA Support

- ✅ **coss ui**: Full ARIA support built-in
- ✅ **Prompt Kit**: Semantic HTML with proper roles
- ⚠️ **Fancy Components**: Requires manual ARIA additions

---

## Migration Path

### From Existing UI to New System

1. **Foundation (Week 1)**
   - Replace all basic UI with coss ui components
   - Ensure forms, buttons, inputs use coss ui

2. **AI Features (Week 2)**
   - Integrate Prompt Kit for AI interactions
   - Replace custom chat UI with Prompt Kit components

3. **Polish (Week 3-4)**
   - Add Fancy Components for micro-interactions
   - Implement scroll animations
   - Add hover effects to CTAs

4. **Optimization (Week 5)**
   - Lazy load heavy Fancy Components
   - Implement reduced motion fallbacks
   - Performance testing

---

## Best Practices

### Code Organization

```
components/
├── ui/              # coss ui (never modify these)
├── prompt-kit/      # Prompt Kit (never modify these)
├── fancy/           # Fancy Components (never modify these)
└── custom/          # Your custom components (compose here)
    ├── Hero.tsx     # Uses Fancy + coss ui
    ├── ChatBox.tsx  # Uses Prompt Kit + coss ui
    └── CTA.tsx      # Uses Fancy + coss ui
```

### Naming Conventions

- **coss ui**: Use original component names (`Button`, `Dialog`)
- **Prompt Kit**: Prefix with component name (`PromptInput`, `ChainOfThought`)
- **Fancy**: Use default imports (`Float`, `ScrambleHover`)

### Version Control

```
# Never commit changes to library code
components/ui/*
components/prompt-kit/*
components/fancy/*
hooks/fancy/*

# Always version your custom compositions
components/custom/*
```

---

## Troubleshooting

### Common Issues

**Issue: Motion animations not working**
```bash
# Ensure motion is installed (not framer-motion)
npm install motion
```

**Issue: Import path errors**
```bash
# Restart TypeScript server
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**Issue: coss ui components missing**
```tsx
// Check if using correct import path
import { Button } from "@/components/ui/button" // ✅
import { Button } from "@/ui/button" // ❌
```

**Issue: Fancy component hooks not found**
```tsx
// Use full hook path
import { useMousePosition } from "@/hooks/fancy/use-mouse-position" // ✅
import { useMousePosition } from "@/fancy/hooks" // ❌
```

---

## Resources

- **coss ui Documentation**: [COSS_UI_MIGRATION.md](./COSS_UI_MIGRATION.md)
- **Prompt Kit Guide**: [PROMPT_KIT_INTEGRATION.md](./PROMPT_KIT_INTEGRATION.md)
- **Fancy Components**: https://fancycomponents.dev
- **Motion Library**: https://motion.dev
- **Base UI**: https://base-ui.com

---

## Next Steps

See [UI_REBUILD_STRATEGY.md](./UI_REBUILD_STRATEGY.md) for the complete plan to rebuild Campus GTM's UI using all three libraries.
