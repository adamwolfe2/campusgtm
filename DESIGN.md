# Campus GTM Design System
**Notion-Inspired UI Architecture for University Go-To-Market Platform**

---

## 📋 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design Tokens](#design-tokens)
3. [Core Components](#core-components)
4. [Block System](#block-system)
5. [Layout Architecture](#layout-architecture)
6. [Animation Standards](#animation-standards)
7. [Accessibility](#accessibility)
8. [Mobile-First Approach](#mobile-first-approach)
9. [Campus GTM Specific Patterns](#campus-gtm-specific-patterns)
10. [Implementation Guidelines](#implementation-guidelines)

---

## Design Philosophy

### Core Principles

**1. Block-First Architecture**
- Every piece of content is a manipulable block
- Drag-and-drop by default
- Inline editing everywhere
- Composable and nestable

**2. Minimalist Aesthetic**
- Generous whitespace (minimum 8px between elements)
- Subtle animations (never flashy)
- Clean typography hierarchy
- Muted color palette with purposeful accents

**3. Mobile-First Responsive**
- Build for 320px screens first
- Progressive enhancement for larger viewports
- Touch targets minimum 44x44px
- Bottom navigation on mobile

**4. Instant Feedback**
- <100ms visual response to interactions
- Optimistic UI updates
- Loading states for operations >300ms
- Clear error messaging

**5. Accessible by Default**
- Full keyboard navigation
- ARIA labels on all interactive elements
- 4.5:1 minimum contrast ratio
- Screen reader tested

---

## Design Tokens

### Color System

**Notion's 10-Color Palette:**

```typescript
// colors.ts
export const notionColors = {
  grey: { text: '#787774', bg: '#F7F6F3', dark: '#2F2F2F' },
  brown: { text: '#9F6B53', bg: '#F4EEEE' },
  orange: { text: '#D9730D', bg: '#FBECDD' },
  yellow: { text: '#CB912F', bg: '#FBF3DB' },
  green: { text: '#448361', bg: '#EDF3EC' },
  blue: { text: '#337EA9', bg: '#E7F3F8', accent: '#2EAADC' },
  purple: { text: '#9065B0', bg: '#F6F3F9' },
  pink: { text: '#C14C8A', bg: '#FAF1F5' },
  red: { text: '#D44C47', bg: '#FFEEF0' },
} as const;

export const baseColors = {
  bg: {
    primary: '#FFFFFF',
    secondary: '#F7F6F3',
    tertiary: '#EDEDED',
  },
  text: {
    primary: '#37352F',
    secondary: '#787774',
    tertiary: '#9B9A97',
  },
  border: {
    default: '#E3E2E0',
    hover: '#D3D3D3',
  },
} as const;
```

**Tailwind Config:**

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        notion: {
          grey: { text: '#787774', bg: '#F7F6F3' },
          brown: { text: '#9F6B53', bg: '#F4EEEE' },
          orange: { text: '#D9730D', bg: '#FBECDD' },
          yellow: { text: '#CB912F', bg: '#FBF3DB' },
          green: { text: '#448361', bg: '#EDF3EC' },
          blue: { text: '#337EA9', bg: '#E7F3F8', accent: '#2EAADC' },
          purple: { text: '#9065B0', bg: '#F6F3F9' },
          pink: { text: '#C14C8A', bg: '#FAF1F5' },
          red: { text: '#D44C47', bg: '#FFEEF0' },
        },
        base: {
          'bg-primary': '#FFFFFF',
          'bg-secondary': '#F7F6F3',
          'bg-tertiary': '#EDEDED',
          'text-primary': '#37352F',
          'text-secondary': '#787774',
          'text-tertiary': '#9B9A97',
        },
        border: {
          DEFAULT: '#E3E2E0',
          hover: '#D3D3D3',
        },
      },
    },
  },
}
```

### Spacing System

**4px Grid:**

```typescript
export const spacing = {
  1: '4px',   // 0.25rem
  2: '8px',   // 0.5rem
  3: '12px',  // 0.75rem
  4: '16px',  // 1rem
  5: '20px',  // 1.25rem
  6: '24px',  // 1.5rem
  8: '32px',  // 2rem
  12: '48px', // 3rem
  16: '64px', // 4rem
  24: '96px', // 6rem
} as const;
```

**Usage:**
```tsx
// Consistent spacing between elements
<div className="space-y-4"> {/* 16px vertical gap */}
  <Card />
  <Card />
</div>

// Padding
<div className="p-6"> {/* 24px all sides */}
```

### Typography

**Font Stack:**

```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
```

**Type Scale:**

```typescript
export const typography = {
  h1: { size: '40px', lineHeight: '1.2', weight: '700' },
  h2: { size: '32px', lineHeight: '1.2', weight: '600' },
  h3: { size: '24px', lineHeight: '1.2', weight: '600' },
  h4: { size: '20px', lineHeight: '1.5', weight: '600' },
  body: { size: '16px', lineHeight: '1.5', weight: '400' },
  small: { size: '14px', lineHeight: '1.5', weight: '400' },
  caption: { size: '12px', lineHeight: '1.5', weight: '400' },
} as const;
```

**Font Weights:**
- Regular: 400 (body text)
- Medium: 500 (emphasized text)
- Semibold: 600 (headings, labels)
- Bold: 700 (page titles)

### Shadows

```typescript
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 4px 8px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.08)',
  lg: '0 12px 24px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.08)',
  focus: '0 0 0 3px rgba(46, 170, 220, 0.2)',
} as const;
```

### Border Radius

```typescript
export const radius = {
  sm: '6px',   // Buttons, inputs
  md: '8px',   // Cards
  lg: '12px',  // Modals
  xl: '16px',  // Large containers
  full: '999px', // Pills, avatars
} as const;
```

### Animation Timing

```typescript
export const timing = {
  instant: 100,  // Button press acknowledgment
  fast: 150,     // Hover states, color changes
  normal: 250,   // Modals, dropdowns, state changes
  slow: 350,     // Complex multi-step animations
} as const;

export const easing = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
```

### Z-Index Scale

```typescript
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  toast: 1400,
} as const;
```

---

## Core Components

### Button

**Variants:** `primary | secondary | ghost | danger`
**Sizes:** `sm | md | lg`

```tsx
// components/ui/button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

// Usage
<Button variant="primary" size="md" icon={<PlusIcon />}>
  Create Strategy
</Button>
```

**Styles:**

```tsx
const buttonVariants = {
  primary: 'bg-notion-blue-accent text-white hover:bg-[#2596BE] shadow-sm',
  secondary: 'bg-notion-blue-bg text-notion-blue-text hover:bg-[#D0E9F5]',
  ghost: 'bg-transparent text-base-text-secondary hover:bg-black/5',
  danger: 'bg-notion-red-bg text-notion-red-text hover:bg-notion-red-text hover:text-white',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

// Base classes
const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-all duration-150 ease-out-expo hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-blue-accent focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none';
```

### Input

**Types:** `text | email | password | number | textarea | select`

```tsx
// components/ui/input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

// Usage
<Input
  label="Campaign Name"
  placeholder="Enter campaign name..."
  error={errors.name}
  hint="Choose a descriptive name"
/>
```

**Styles:**

```tsx
const inputClasses = 'w-full px-3 py-2 border border-border rounded-sm text-base bg-base-bg-primary text-base-text-primary placeholder:text-base-text-tertiary transition-all duration-150 ease-out-expo hover:border-border-hover focus:outline-none focus:border-notion-blue-accent focus:shadow-focus disabled:opacity-50 disabled:cursor-not-allowed';

const errorClasses = 'border-notion-red-text focus:shadow-[0_0_0_3px_rgba(212,76,71,0.2)]';
```

### Checkbox & Toggle

```tsx
// Checkbox
<Checkbox
  checked={isChecked}
  onCheckedChange={setIsChecked}
  label="Enable notifications"
/>

// Toggle Switch
<Toggle
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
  label="Auto-save"
/>
```

**Styles:**

```css
/* Checkbox */
.checkbox {
  @apply w-4 h-4 border border-border rounded-sm cursor-pointer transition-all duration-150 ease-out-expo;
  @apply checked:bg-notion-blue-accent checked:border-notion-blue-accent;
  @apply focus-visible:ring-2 focus-visible:ring-notion-blue-accent focus-visible:ring-offset-2;
}

/* Toggle */
.toggle {
  @apply w-10 h-5 bg-base-bg-tertiary rounded-full relative cursor-pointer transition-all duration-250 ease-out-expo;
  @apply checked:bg-notion-green-text;
}

.toggle::after {
  @apply content-[''] absolute w-4 h-4 bg-white rounded-full top-0.5 left-0.5 shadow-sm transition-transform duration-250 ease-out-expo;
  @apply checked:translate-x-5;
}
```

### Card

```tsx
// components/ui/card.tsx
interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// Usage
<Card hoverable clickable onClick={handleClick}>
  <CardHeader>
    <CardTitle>Strategy Module</CardTitle>
    <CardDescription>Ambassador Program</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Styles:**

```tsx
const cardClasses = 'bg-base-bg-primary border border-border rounded-md p-4 shadow-sm transition-all duration-250 ease-out-expo';

const hoverableClasses = 'hover:-translate-y-0.5 hover:shadow-md hover:border-border-hover';

const clickableClasses = 'cursor-pointer active:translate-y-0 active:shadow-sm';
```

### Modal/Dialog

```tsx
// components/ui/modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// Usage
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Delete Campaign"
  description="This action cannot be undone"
  size="md"
>
  <ModalContent>
    {/* Content */}
  </ModalContent>
  <ModalFooter>
    <Button variant="ghost" onClick={onClose}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
  </ModalFooter>
</Modal>
```

**Animation:**

```tsx
// Framer Motion variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  },
};

// Usage with AnimatePresence
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1200]"
      />
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1201]"
      >
        {/* Modal content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Dropdown Menu

```tsx
// components/ui/dropdown-menu.tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="ghost" icon={<MoreIcon />}>
      Options
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleEdit}>
      <EditIcon /> Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDuplicate}>
      <CopyIcon /> Duplicate
    </DropdownMenuItem>
    <DropdownMenuDivider />
    <DropdownMenuItem onClick={handleDelete} destructive>
      <TrashIcon /> Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Animation:**

```tsx
const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] }
  },
};
```

### Toast Notifications

```tsx
// lib/toast.ts
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      duration: 3000,
      className: 'border-l-4 border-notion-green-text',
    });
  },
  error: (message: string) => {
    sonnerToast.error(message, {
      duration: 4000,
      className: 'border-l-4 border-notion-red-text',
    });
  },
  info: (message: string) => {
    sonnerToast(message, {
      duration: 3000,
      className: 'border-l-4 border-notion-blue-accent',
    });
  },
};

// Usage
toast.success('Strategy generated successfully!');
toast.error('Failed to save changes');
```

---

## Block System

### Block Architecture

**Block Interface:**

```typescript
// types/block.ts
export interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata?: Record<string, unknown>;
  children?: Block[];
  createdAt: Date;
  updatedAt: Date;
}

export const BlockType = {
  TEXT: 'text',
  HEADING_1: 'heading_1',
  HEADING_2: 'heading_2',
  HEADING_3: 'heading_3',
  BULLET_LIST: 'bullet_list',
  NUMBERED_LIST: 'numbered_list',
  CHECKLIST: 'checklist',
  QUOTE: 'quote',
  DIVIDER: 'divider',
  AI_BLOCK: 'ai_block',
  IMAGE: 'image',
  EMBED: 'embed',
} as const;
```

### Block Component

```tsx
// components/block/block.tsx
interface BlockProps {
  block: Block;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onAddBelow: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  editable?: boolean;
}

export function Block({
  block,
  onUpdate,
  onDelete,
  onAddBelow,
  editable = true,
}: BlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      {editable && isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-base-text-tertiary hover:text-base-text-secondary"
          draggable
        >
          <GripVertical className="h-4 w-4" />
        </motion.div>
      )}

      {/* Block Content */}
      <div
        className={cn(
          'px-2 py-1 rounded-sm transition-colors duration-150',
          isHovered && 'bg-base-bg-secondary',
          isFocused && 'border-l-2 border-notion-blue-accent pl-[6px]'
        )}
      >
        <BlockContent
          block={block}
          editable={editable}
          onUpdate={(content) => onUpdate(block.id, content)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>

      {/* Action Buttons */}
      {editable && isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddBelow(block.id)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onDelete(block.id)}>
                <Trash className="h-3 w-3" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      )}
    </motion.div>
  );
}
```

### Block Content Renderer

```tsx
// components/block/block-content.tsx
function BlockContent({ block, editable, onUpdate, onFocus, onBlur }: BlockContentProps) {
  switch (block.type) {
    case BlockType.HEADING_1:
      return (
        <h1
          className="text-h1 font-bold text-base-text-primary"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => {
            onUpdate(e.currentTarget.textContent || '');
            onBlur();
          }}
          onFocus={onFocus}
        >
          {block.content}
        </h1>
      );

    case BlockType.HEADING_2:
      return (
        <h2
          className="text-h2 font-semibold text-base-text-primary"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => {
            onUpdate(e.currentTarget.textContent || '');
            onBlur();
          }}
          onFocus={onFocus}
        >
          {block.content}
        </h2>
      );

    case BlockType.TEXT:
      return (
        <p
          className="text-body text-base-text-primary leading-relaxed"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => {
            onUpdate(e.currentTarget.textContent || '');
            onBlur();
          }}
          onFocus={onFocus}
        >
          {block.content || (
            <span className="text-base-text-tertiary">
              Type '/' for commands...
            </span>
          )}
        </p>
      );

    case BlockType.BULLET_LIST:
      return (
        <div className="flex items-start gap-2">
          <span className="text-base-text-secondary mt-1">•</span>
          <span
            className="flex-1 text-body text-base-text-primary"
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => {
              onUpdate(e.currentTarget.textContent || '');
              onBlur();
            }}
            onFocus={onFocus}
          >
            {block.content}
          </span>
        </div>
      );

    case BlockType.CHECKLIST:
      return (
        <div className="flex items-start gap-2">
          <Checkbox
            checked={block.metadata?.checked as boolean}
            onCheckedChange={(checked) => {
              // Update metadata
            }}
            className="mt-1"
          />
          <span
            className="flex-1 text-body text-base-text-primary"
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => {
              onUpdate(e.currentTarget.textContent || '');
              onBlur();
            }}
            onFocus={onFocus}
          >
            {block.content}
          </span>
        </div>
      );

    case BlockType.QUOTE:
      return (
        <blockquote
          className="border-l-4 border-base-text-tertiary pl-4 py-2 text-base italic text-base-text-secondary"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => {
            onUpdate(e.currentTarget.textContent || '');
            onBlur();
          }}
          onFocus={onFocus}
        >
          {block.content}
        </blockquote>
      );

    default:
      return null;
  }
}
```

### Slash Command Menu

```tsx
// components/block/slash-command-menu.tsx
interface SlashCommand {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  keywords: string[];
  action: () => void;
}

const slashCommands: SlashCommand[] = [
  {
    id: 'heading1',
    title: 'Heading 1',
    description: 'Big section heading',
    icon: Heading1,
    keywords: ['h1', 'heading', 'title'],
    action: () => insertBlock(BlockType.HEADING_1),
  },
  {
    id: 'heading2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    keywords: ['h2', 'heading', 'subtitle'],
    action: () => insertBlock(BlockType.HEADING_2),
  },
  // ... more commands
];

export function SlashCommandMenu({ position, onSelect, onClose }: SlashCommandMenuProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = slashCommands.filter((cmd) =>
    cmd.keywords.some((keyword) => keyword.includes(search.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute z-dropdown bg-base-bg-primary border border-border rounded-md shadow-lg p-1 min-w-[280px]"
      style={{ top: position.y, left: position.x }}
    >
      <div className="flex flex-col gap-0.5">
        {filteredCommands.map((cmd, index) => {
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-sm text-left transition-colors duration-150',
                index === selectedIndex
                  ? 'bg-notion-blue-bg text-notion-blue-text'
                  : 'hover:bg-base-bg-secondary'
              )}
              onClick={() => {
                cmd.action();
                onSelect();
              }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{cmd.title}</div>
                <div className="text-xs text-base-text-tertiary truncate">
                  {cmd.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
```

### Drag and Drop

```tsx
// hooks/useDragAndDrop.ts
export function useDragAndDrop(blocks: Block[], onReorder: (blocks: Block[]) => void) {
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const handleDragStart = (blockId: string) => {
    setDraggedBlockId(blockId);
  };

  const handleDragOver = (blockId: string) => {
    if (blockId !== draggedBlockId) {
      setDropTargetId(blockId);
    }
  };

  const handleDrop = () => {
    if (!draggedBlockId || !dropTargetId) return;

    const draggedIndex = blocks.findIndex((b) => b.id === draggedBlockId);
    const targetIndex = blocks.findIndex((b) => b.id === dropTargetId);

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedBlock);

    onReorder(newBlocks);
    setDraggedBlockId(null);
    setDropTargetId(null);
  };

  return {
    draggedBlockId,
    dropTargetId,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
```

---

## Layout Architecture

### App Shell Structure

```tsx
// components/layout/app-shell.tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-base-bg-primary">
          <div className="container max-w-7xl mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav className="md:hidden" />
    </div>
  );
}
```

### Sidebar

```tsx
// components/layout/sidebar.tsx
export function Sidebar({ open, onOpenChange }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{
        width: open ? 240 : 60,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
      className="relative border-r border-border bg-base-bg-secondary overflow-hidden"
    >
      {/* Sidebar Header */}
      <div className="h-12 flex items-center px-4 border-b border-border">
        <motion.div
          animate={{ opacity: open ? 1 : 0 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-5 w-5 text-notion-blue-accent" />
          {open && <span className="font-semibold">Campus GTM</span>}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        <SidebarItem
          icon={Home}
          label="Dashboard"
          href="/dashboard"
          collapsed={!open}
        />
        <SidebarItem
          icon={Users}
          label="Campaigns"
          href="/campaigns"
          collapsed={!open}
        />
        <SidebarItem
          icon={BarChart3}
          label="Analytics"
          href="/analytics"
          collapsed={!open}
        />
        <SidebarItem
          icon={Settings}
          label="Settings"
          href="/settings"
          collapsed={!open}
        />
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => onOpenChange(!open)}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 p-1.5 rounded-md hover:bg-base-bg-tertiary transition-colors"
      >
        {open ? <ChevronLeft /> : <ChevronRight />}
      </button>
    </motion.aside>
  );
}

function SidebarItem({ icon: Icon, label, href, collapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-2 py-2 rounded-sm transition-colors duration-150',
        isActive
          ? 'bg-notion-blue-bg text-notion-blue-text font-medium'
          : 'text-base-text-secondary hover:bg-base-bg-tertiary'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="text-sm truncate">{label}</span>}
    </Link>
  );
}
```

### Top Bar

```tsx
// components/layout/top-bar.tsx
export function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useUser();

  return (
    <header className="h-12 border-b border-border bg-base-bg-primary/80 backdrop-blur-sm sticky top-0 z-sticky">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left: Menu button + Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Breadcrumbs />
        </div>

        {/* Right: Search + User menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar src={user?.imageUrl} name={user?.fullName} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuDivider />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
```

### Mobile Bottom Navigation

```tsx
// components/layout/mobile-bottom-nav.tsx
export function MobileBottomNav({ className }: { className?: string }) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Users, label: 'Campaigns', href: '/campaigns' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 h-14 bg-base-bg-primary border-t border-border z-sticky',
        className
      )}
    >
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] h-12 rounded-md transition-colors duration-150',
                isActive
                  ? 'text-notion-blue-accent bg-notion-blue-bg'
                  : 'text-base-text-secondary'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Responsive Breakpoints

```typescript
// lib/breakpoints.ts
export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const;

// Tailwind screens config
module.exports = {
  theme: {
    screens: {
      'sm': '768px',
      'md': '1024px',
      'lg': '1280px',
    },
  },
}
```

---

## Animation Standards

### Core Animation Principles

1. **Performance**: Only animate `transform` and `opacity` (GPU-accelerated)
2. **Timing**: 100-350ms range, never exceed 400ms
3. **Easing**: Use `cubic-bezier(0.16, 1, 0.3, 1)` for natural motion
4. **Purpose**: Every animation must serve a functional purpose

### Framer Motion Variants

```typescript
// lib/animation-variants.ts

// Page transitions
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] }
  },
};

// Card hover lift
export const cardVariants = {
  rest: { y: 0, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' },
  hover: {
    y: -2,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  },
  tap: {
    y: 0,
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

// Modal slide-up
export const modalVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  },
};

// Dropdown slide-down
export const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] }
  },
};

// Staggered list
export const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.15 }
  },
};
```

### Micro-interactions

```tsx
// Button press feedback
<motion.button
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.1 }}
>
  Click me
</motion.button>

// Checkbox pop
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{
    type: "spring",
    stiffness: 500,
    damping: 30
  }}
>
  <CheckIcon />
</motion.div>

// Loading spinner
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    duration: 0.8,
    repeat: Infinity,
    ease: "linear"
  }}
>
  <Loader className="h-4 w-4" />
</motion.div>

// Skeleton shimmer
<motion.div
  className="bg-gradient-to-r from-base-bg-secondary via-base-bg-tertiary to-base-bg-secondary bg-[length:200%_100%]"
  animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: "linear"
  }}
/>
```

### Reduced Motion

```tsx
// lib/use-reduced-motion.ts
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Usage
function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : {}}
      animate={!prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
      transition={!prefersReducedMotion ? { duration: 0.25 } : { duration: 0.01 }}
    >
      Content
    </motion.div>
  );
}
```

---

## Accessibility

### Keyboard Navigation

**Tab Order:**
- Logical flow: left-to-right, top-to-bottom
- Skip to content link as first focusable element
- Modal traps focus until closed

**Focus Indicators:**

```css
/* Base focus style */
.focusable {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-blue-accent focus-visible:ring-offset-2;
}

/* For dark backgrounds */
.focusable-dark {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black;
}
```

**Keyboard Shortcuts:**

```typescript
// hooks/use-keyboard-shortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }

      // Cmd/Ctrl + N: New workspace
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNewWorkspace();
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

### ARIA Labels

```tsx
// Button with icon only
<button aria-label="Delete strategy module">
  <Trash className="h-4 w-4" />
</button>

// Form input
<Input
  label="Campaign Name"
  aria-label="Campaign name"
  aria-required="true"
  aria-invalid={!!errors.name}
  aria-describedby={errors.name ? "name-error" : undefined}
/>
{errors.name && (
  <span id="name-error" className="text-sm text-notion-red-text">
    {errors.name}
  </span>
)}

// Modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Delete Campaign</h2>
  <p id="modal-description">This action cannot be undone.</p>
</div>

// Live region for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Tab navigation
<div role="tablist">
  <button
    role="tab"
    aria-selected={activeTab === 'overview'}
    aria-controls="overview-panel"
  >
    Overview
  </button>
</div>
<div
  role="tabpanel"
  id="overview-panel"
  aria-labelledby="overview-tab"
>
  {/* Content */}
</div>
```

### Color Contrast

**WCAG AA Standards:**
- Body text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Testing:**

```bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/react

# In your app
import { useEffect } from 'react';

if (process.env.NODE_ENV === 'development') {
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}
```

### Screen Reader Support

```tsx
// Skip to content link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-base-bg-primary focus:border focus:border-border focus:rounded-md"
>
  Skip to main content
</a>

// Screen reader only text
<span className="sr-only">Loading strategies...</span>

// sr-only utility
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Mobile-First Approach

### Touch Targets

**Minimum Sizes:**
- Mobile: 44x44px
- Desktop: 40x40px
- Spacing: 8px minimum between targets

```tsx
// components/ui/touch-target.tsx
export function TouchTarget({ children, onClick }: TouchTargetProps) {
  return (
    <button
      onClick={onClick}
      className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-md hover:bg-base-bg-secondary active:bg-base-bg-tertiary transition-colors"
    >
      {children}
    </button>
  );
}
```

### Mobile Navigation Patterns

```tsx
// Slide-over sidebar on mobile
<AnimatePresence>
  {sidebarOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 bg-black/50 z-[1100] md:hidden"
      />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 top-0 bottom-0 w-[280px] bg-base-bg-primary border-r border-border shadow-lg z-[1101] md:hidden"
      >
        {/* Sidebar content */}
      </motion.aside>
    </>
  )}
</AnimatePresence>
```

### Responsive Typography

```css
/* Mobile-first type scale */
.text-h1 { @apply text-3xl md:text-4xl lg:text-5xl; }
.text-h2 { @apply text-2xl md:text-3xl lg:text-4xl; }
.text-h3 { @apply text-xl md:text-2xl lg:text-3xl; }
.text-h4 { @apply text-lg md:text-xl; }
.text-body { @apply text-base; }
.text-small { @apply text-sm; }
.text-caption { @apply text-xs; }
```

### Mobile Gestures

```tsx
// Swipe to delete
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

function SwipeableItem({ onDelete, children }: SwipeableItemProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0], [0, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete();
    } else {
      x.set(0);
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 0 }}
      dragElastic={0.2}
      style={{ x }}
      onDragEnd={handleDragEnd}
      className="relative"
    >
      <motion.div
        style={{ opacity }}
        className="absolute right-0 top-0 bottom-0 w-20 bg-notion-red-text flex items-center justify-center text-white"
      >
        <Trash className="h-5 w-5" />
      </motion.div>
      {children}
    </motion.div>
  );
}
```

---

## Campus GTM Specific Patterns

### Strategy Module Card

```tsx
// components/strategy/strategy-module-card.tsx
export function StrategyModuleCard({ module }: { module: StrategyModule }) {
  const router = useRouter();
  const Icon = MODULE_ICONS[module.type];
  const colorClass = MODULE_COLORS[module.type];

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <Card
        hoverable
        clickable
        onClick={() => router.push(`/workspace/${module.workspaceId}/module/${module.id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg text-white',
                  colorClass
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>
                  {module.blocks.length} blocks
                </CardDescription>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(module.id)}>
                  <Edit className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate(module.id)}>
                  <Copy className="h-4 w-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuDivider />
                <DropdownMenuItem onClick={() => handleDelete(module.id)} destructive>
                  <Trash className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            {module.blocks.slice(0, 3).map((block) => (
              <BlockPreview key={block.id} block={block} />
            ))}
            {module.blocks.length > 3 && (
              <p className="text-sm text-base-text-tertiary">
                +{module.blocks.length - 3} more blocks
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### Workspace Dashboard

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  const { user } = useUser();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithModules[]>([]);

  return (
    <AppShell>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-h1 font-bold text-base-text-primary">
              Welcome back, {user?.firstName}
            </h1>
            <p className="text-base text-base-text-secondary mt-2">
              {workspaces.length} active {workspaces.length === 1 ? 'workspace' : 'workspaces'}
            </p>
          </div>

          <Button variant="primary" onClick={() => router.push('/onboarding')}>
            <Plus className="h-4 w-4" />
            New Strategy
          </Button>
        </div>

        {/* Workspaces Grid */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {workspaces.map((workspace) => (
            <motion.div key={workspace.id} variants={listItemVariants}>
              <WorkspaceCard workspace={workspace} />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {workspaces.length === 0 && (
          <Card className="p-12 text-center">
            <Sparkles className="h-12 w-12 text-notion-blue-accent mx-auto mb-4" />
            <h3 className="text-h3 font-semibold mb-2">
              Create your first GTM strategy
            </h3>
            <p className="text-base text-base-text-secondary mb-6">
              Answer a few questions and let AI build your complete go-to-market plan
            </p>
            <Button variant="primary" onClick={() => router.push('/onboarding')}>
              Get Started
            </Button>
          </Card>
        )}
      </motion.div>
    </AppShell>
  );
}
```

### Analytics Dashboard

```tsx
// components/analytics/analytics-dashboard.tsx
export function AnalyticsDashboard({ metrics }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Campaigns"
          value={metrics.totalCampaigns}
          change={metrics.campaignsChange}
          trend={metrics.campaignsTrend}
          icon={Users}
        />
        <MetricCard
          title="Active Contacts"
          value={metrics.activeContacts}
          change={metrics.contactsChange}
          trend={metrics.contactsTrend}
          icon={BarChart3}
        />
        <MetricCard
          title="Response Rate"
          value={`${metrics.responseRate}%`}
          change={metrics.responseRateChange}
          trend={metrics.responseRateTrend}
          icon={TrendingUp}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          change={metrics.conversionRateChange}
          trend={metrics.conversionRateTrend}
          icon={Target}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart component */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart component */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-small text-base-text-secondary mb-1">{title}</p>
            <p className="text-h2 font-bold text-base-text-primary">{value}</p>
          </div>
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            'bg-notion-blue-bg text-notion-blue-text'
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className={cn(
            'flex items-center gap-1 text-small font-medium',
            trend === 'up' ? 'text-notion-green-text' : 'text-notion-red-text'
          )}>
            {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {change}
          </span>
          <span className="text-small text-base-text-tertiary">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Implementation Guidelines

### Component Checklist

When building a new component:

- [ ] **Visual Design**
  - [ ] Uses colors from 10-color palette only
  - [ ] Maintains 4.5:1 minimum contrast ratio
  - [ ] Follows 4px/8px spacing grid
  - [ ] Applies correct border-radius (6px/8px/12px)
  - [ ] Includes dark mode support (if applicable)

- [ ] **Interactivity**
  - [ ] All interactive elements have hover/focus/active states
  - [ ] Animations use 150-350ms timing with ease-out easing
  - [ ] Provides instant visual feedback (<100ms)
  - [ ] Supports full keyboard navigation
  - [ ] Includes loading states for async operations

- [ ] **Responsive**
  - [ ] Works on 320px mobile screens
  - [ ] Touch targets minimum 44x44px on mobile
  - [ ] Adapts layout at 768px (tablet) and 1024px (desktop)
  - [ ] Text remains readable without horizontal scroll
  - [ ] Mobile-specific interactions (swipe, bottom nav)

- [ ] **Accessibility**
  - [ ] Uses semantic HTML elements
  - [ ] ARIA labels for icons and custom controls
  - [ ] Focus indicators clearly visible (2px outline, 3px offset)
  - [ ] Respects `prefers-reduced-motion`
  - [ ] Screen reader tested with NVDA/VoiceOver

- [ ] **Performance**
  - [ ] Animations use `transform`/`opacity` only
  - [ ] Images lazy-loaded and optimized
  - [ ] No layout thrashing
  - [ ] Debounced rapid state updates
  - [ ] Memoized expensive calculations

### Code Organization

```
components/
├── ui/                   # Base UI components (shadcn)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── layout/               # Layout components
│   ├── app-shell.tsx
│   ├── sidebar.tsx
│   ├── top-bar.tsx
│   └── mobile-bottom-nav.tsx
├── block/                # Block system components
│   ├── block.tsx
│   ├── block-content.tsx
│   ├── block-list.tsx
│   └── slash-command-menu.tsx
├── strategy/             # Strategy-specific components
│   ├── strategy-module-card.tsx
│   ├── strategy-module-view.tsx
│   └── block-renderer.tsx
├── analytics/            # Analytics components
│   ├── analytics-dashboard.tsx
│   ├── metric-card.tsx
│   └── chart.tsx
└── ...

lib/
├── animation-variants.ts # Framer Motion variants
├── breakpoints.ts        # Responsive breakpoints
├── colors.ts             # Color palette
├── spacing.ts            # Spacing scale
├── typography.ts         # Type scale
└── utils.ts              # Utility functions (cn, etc.)
```

### Testing

```bash
# Visual regression testing
npm install --save-dev @storybook/react

# Accessibility testing
npm install --save-dev @axe-core/react jest-axe

# Performance testing
npm install --save-dev @testing-library/react @testing-library/user-event
```

### Performance Budgets

- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Bundle Size (per route):** < 200KB gzipped

---

## Quick Reference

### Common Patterns

```tsx
// Page layout
<AppShell>
  <motion.div variants={pageVariants} initial="initial" animate="animate">
    <PageHeader title="Page Title" />
    <PageContent>
      {/* Content */}
    </PageContent>
  </motion.div>
</AppShell>

// Form submission
const handleSubmit = async (data: FormData) => {
  try {
    await submitData(data);
    toast.success('Saved successfully!');
  } catch (error) {
    toast.error('Failed to save');
  }
};

// Loading state
{isLoading ? (
  <div className="flex items-center justify-center p-12">
    <Loader className="h-6 w-6 animate-spin text-notion-blue-accent" />
  </div>
) : (
  <DataDisplay data={data} />
)}

// Empty state
{items.length === 0 && (
  <Card className="p-12 text-center">
    <Icon className="h-12 w-12 text-base-text-tertiary mx-auto mb-4" />
    <h3 className="text-h4 font-semibold mb-2">No items yet</h3>
    <p className="text-base text-base-text-secondary mb-6">
      Get started by creating your first item
    </p>
    <Button variant="primary" onClick={handleCreate}>
      Create Item
    </Button>
  </Card>
)}
```

---

## Resources

- **Notion Design**: https://www.notion.so
- **Radix UI**: https://www.radix-ui.com
- **Framer Motion**: https://www.framer.com/motion
- **Tailwind CSS**: https://tailwindcss.com
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref
- **Web Vitals**: https://web.dev/vitals

---

## Changelog

### Version 1.0.0 (2025-11-19)
- Initial design system documentation
- Integrated Notion UI principles
- Added Campus GTM specific patterns
- Comprehensive component specifications
- Animation and accessibility standards
