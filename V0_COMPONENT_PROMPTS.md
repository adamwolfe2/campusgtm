# v0.dev Component Generation Prompts

**Project:** Campus GTM - Notion-style AI GTM Platform
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion

Use these prompts in v0.dev to generate polished components for Campus GTM.

---

## 🎯 Priority Components to Generate

### 1. Dashboard Loading Skeleton

**v0 Prompt:**
```
Create a loading skeleton for a GTM dashboard with:
- Header with "The War Room" title and "New Strategy" button skeleton
- Grid of 3 strategy cards (2 columns on mobile, 3 on desktop)
- Each card has: icon circle, title, description (2 lines), and "View" button
- Use Tailwind CSS with animate-pulse
- Shadcn/UI card component style
- Mobile-first responsive design
- Smooth fade-in animation when loading completes

Tech: Next.js 14, TypeScript, Tailwind, Shadcn/UI
```

**File to create:** `components/dashboard-skeleton.tsx`

---

### 2. Workspace Card with Hover Effects

**v0 Prompt:**
```
Design a workspace strategy card with:
- Icon with background color (blue, green, orange, purple, pink)
- Title (truncate at 2 lines)
- Description/preview text (3 lines max)
- Last updated timestamp
- "Edit" button that appears on hover
- Card lifts on hover (y: -2px)
- Subtle shadow that increases on hover
- Framer Motion animations
- Mobile: Always show Edit button, no hover effects
- Desktop: Hide Edit button until hover

Colors from Notion palette:
- Blue: #2EAADC
- Green: #448361
- Orange: #D9730D
- Purple: #9065B0
- Pink: #C14C8A

Tech: Next.js 14, TypeScript, Tailwind, Framer Motion, Lucide icons
```

**File to create:** `components/workspace-card.tsx`

---

### 3. Empty State for Dashboard

**v0 Prompt:**
```
Create an empty state for a workspace dashboard showing:
- Centered layout with max-width container
- Illustration or icon (Sparkles icon, large size)
- Heading: "Create your first GTM strategy"
- Description: "Get started by answering a few questions about your company. Our AI will generate a complete campus GTM strategy in minutes."
- Primary CTA button: "Start Onboarding" with arrow icon
- Secondary link: "Learn how it works"
- Smooth fade-in animation with Framer Motion
- Mobile-responsive spacing

Design style: Notion-inspired, minimal, generous whitespace
Tech: Next.js 14, TypeScript, Tailwind, Framer Motion, Lucide icons
```

**File to create:** `components/empty-state.tsx`

---

### 4. Form Input with Validation States

**v0 Prompt:**
```
Build a reusable form input component with:
- Label with optional indicator (*)
- Input field with proper focus states
- Error state: red border + error message below with alert icon
- Success state: green border + checkmark icon
- Hint text in muted color
- Smooth transitions between states (150ms)
- Proper ARIA labels for accessibility
- Min height 44px for mobile touch targets

States to show:
1. Default
2. Focus (blue ring)
3. Error (red border, shake animation)
4. Success (green border, checkmark)

Tech: Next.js 14, TypeScript, Tailwind, Framer Motion, Lucide icons
Export as FormInput component with full TypeScript types
```

**File to create:** `components/ui/form-input.tsx`

---

### 5. Mobile-Optimized Module Card

**v0 Prompt:**
```
Design a strategy module card optimized for mobile with:
- Module icon (Users, Calendar, MessageSquare, Zap) with colored background
- Module title (e.g., "Student Ambassador Program")
- Preview of first 2 blocks (text snippets)
- "View Details" button with arrow
- Swipe gesture indicator on mobile
- Touch-friendly sizing (min 44px tap targets)
- Card border on mobile, shadow on desktop
- Responsive: Full width on mobile, max 400px on desktop

Module types and colors:
- Ambassador Program: Blue (#2EAADC)
- Content Calendar: Green (#448361)
- ICP Definition: Orange (#D9730D)
- Outreach Scripts: Purple (#9065B0)
- Virality Engine: Pink (#C14C8A)

Tech: Next.js 14, TypeScript, Tailwind, Framer Motion, Lucide icons
```

**File to create:** `components/module-card-mobile.tsx`

---

### 6. Toast Notification System

**v0 Prompt:**
```
Create a toast notification component with:
- 4 variants: success (green), error (red), warning (yellow), info (blue)
- Icon for each variant (CheckCircle, XCircle, AlertTriangle, Info)
- Title and optional description
- Close button (X icon)
- Auto-dismiss after 5 seconds
- Slide-in from top-right animation
- Stack multiple toasts vertically
- Mobile: Full width at top, Desktop: Max 400px top-right
- Dark mode support

Use Sonner library or custom implementation
Tech: Next.js 14, TypeScript, Tailwind, Framer Motion, Lucide icons
```

**File to create:** `components/ui/toast.tsx`

---

### 7. Loading Button States

**v0 Prompt:**
```
Create a button component with loading states:
- Primary, secondary, ghost, danger variants
- Small, medium, large sizes
- Loading state: spinner + "Loading..." text
- Disabled state: 40% opacity
- Icon support (left or right)
- Full-width option for mobile
- Smooth transitions (150ms)
- Active press state (scale 0.98)

Show all variants in a grid:
- Primary (blue background)
- Secondary (blue text, light blue bg)
- Ghost (transparent, hover bg)
- Danger (red background)

Tech: Next.js 14, TypeScript, Tailwind, Framer Motion, Lucide icons
Extend existing Shadcn/UI button component
```

**File to update:** `components/ui/button.tsx`

---

### 8. Error Boundary Fallback UI

**v0 Prompt:**
```
Design an error boundary fallback component showing:
- Centered layout
- Error illustration or icon (AlertTriangle)
- Heading: "Something went wrong"
- Error message (passed as prop)
- "Try Again" button to reload
- "Go Home" secondary button
- Error details in collapsible accordion (for development)
- Responsive spacing
- Calming color palette (not aggressive red)

Tech: Next.js 14, TypeScript, Tailwind, Framer Motion, Lucide icons
```

**File to create:** `components/error-fallback.tsx`

---

### 9. Responsive Typography Scale

**v0 Prompt:**
```
Create a typography component library with:
- H1: 3xl mobile, 4xl tablet, 5xl desktop
- H2: 2xl mobile, 3xl tablet, 4xl desktop
- H3: xl mobile, 2xl tablet, 3xl desktop
- H4: lg mobile, xl desktop
- Body: base (16px)
- Small: sm (14px)
- Caption: xs (12px)

Features:
- Responsive font sizes with Tailwind
- Proper line heights (1.2 for headings, 1.5 for body)
- Font weights: Bold for headings, Normal for body
- Color variants: primary, secondary, muted
- Truncate option for long text

Export as reusable components: Heading, Text
Tech: Next.js 14, TypeScript, Tailwind
```

**File to create:** `components/ui/typography.tsx`

---

### 10. Search Bar with Keyboard Shortcut

**v0 Prompt:**
```
Build a search bar component with:
- Search icon on left
- Placeholder: "Search workspaces, strategies..."
- Keyboard shortcut indicator: "⌘K" or "Ctrl+K" badge on right
- Focus state: blue ring
- Clear button (X) appears when typing
- Dropdown suggestions below (optional)
- Opens with Cmd+K / Ctrl+K keyboard shortcut
- Mobile: Full width, Desktop: Max 500px
- Smooth animations

Tech: Next.js 14, TypeScript, Tailwind, Framer Motion, Lucide icons
Include keyboard shortcut hook (useKeyboardShortcut)
```

**File to create:** `components/search-bar.tsx`

---

## 🎨 Design System Reference

When generating components, use these design tokens:

### Colors (Notion Palette)
```css
--blue-accent: #2EAADC
--green: #448361
--orange: #D9730D
--purple: #9065B0
--pink: #C14C8A
--grey-text: #787774
--grey-bg: #F7F6F3
--border: #E3E2E0
```

### Animations
```javascript
// All animations: 100-350ms range
// Easing: cubic-bezier(0.16, 1, 0.3, 1)
// Only animate transform and opacity (GPU-accelerated)
```

### Touch Targets
```css
/* Mobile minimum: 44x44px */
/* Desktop minimum: 40x40px */
/* Spacing: 8px minimum between targets */
```

---

## 📝 How to Use v0

### Step-by-Step Process:

1. **Go to v0.dev** and sign in with GitHub
2. **Copy a prompt** from above
3. **Paste into v0** chat interface
4. **Review generated code** - v0 will show you the component with preview
5. **Copy the code** into your project at the specified file path
6. **Test locally** with `npm run dev`
7. **Refine if needed** - ask v0 to adjust colors, spacing, animations
8. **Commit when perfect** - add to your git branch

### Example v0 Workflow:

```bash
# 1. Generate component in v0.dev
# (Copy code from v0)

# 2. Create file locally
touch components/dashboard-skeleton.tsx

# 3. Paste v0 code into file
# (Use your editor)

# 4. Test
npm run dev

# 5. Refine in v0 if needed
# "Make the skeleton animation slower"
# "Add more spacing between cards"

# 6. Commit
git add components/dashboard-skeleton.tsx
git commit -m "feat: add dashboard loading skeleton from v0"
git push
```

---

## 🚀 Priority Order

Generate components in this order for maximum impact:

1. ✅ **Dashboard Loading Skeleton** - Immediate UX improvement
2. ✅ **Empty State** - Better first-time user experience
3. ✅ **Form Input with Validation** - Used throughout onboarding
4. ✅ **Workspace Card** - Core dashboard component
5. ✅ **Module Card Mobile** - Mobile experience improvement
6. ✅ **Toast Notifications** - Standardize feedback
7. ✅ **Loading Button** - Better loading states
8. ✅ **Error Fallback** - Professional error handling
9. ⚪ **Typography** - Nice to have
10. ⚪ **Search Bar** - Can be added later

---

## 📊 Success Metrics

After implementing v0 components, you should see:
- ✅ No jarring layout shifts (loading skeletons)
- ✅ Clear empty states guide new users
- ✅ Form validation feels instant and helpful
- ✅ Mobile experience smooth with proper touch targets
- ✅ Consistent toast notifications
- ✅ Professional error handling

---

## 💡 Pro Tips

1. **Start with one component** - Test the workflow with the dashboard skeleton
2. **Iterate in v0** - Use follow-up prompts to refine: "make it darker", "add more spacing"
3. **Keep your design system** - Always mention Tailwind, Shadcn/UI, Notion-style in prompts
4. **Mobile-first** - Always specify mobile-first responsive design
5. **Copy animations** - If v0 uses different animations, ask it to use Framer Motion
6. **Test on mobile** - Use Chrome DevTools mobile emulator
7. **Commit often** - One component per commit for easy rollback

---

**Ready to start?** Pick the Dashboard Loading Skeleton prompt and paste it into v0.dev!
