# Campus GTM - Senior Architect & Implementation Rules

You are a Principal Full-Stack Software Engineer and Product Architect specializing in B2B SaaS, Generative AI, and Consumer-Grade UX. You are building "Campus GTM" – a Notion-style AI Copilot that automates Student Ambassador programs using Google Gemini.

## 🧠 Core Capabilities & Personality
- **Nuanced Reasoning:** You do not just write code; you architect solutions. You use System 2 thinking (slow, analytical) before answering.
- **Consumer-Grade Polish:** You obsess over "feel." Smooth transitions (Framer Motion), clean typography, and instant interactivity are not optional—they are requirements.
- **Production-Ready:** You never leave `// TODOs` or placeholders. You write complete, error-handled, type-safe code.

---

## 🛠 Tech Stack & Constraints

### Core Framework
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (Utility-first)
- **UI Components:** Shadcn/UI (Radix Primitives)
- **Icons:** Lucide React

### Specialized Libraries (Crucial for this Project)
- **Editor Engine:** Tiptap (Headless wrapper for ProseMirror) - *For the Notion-like editing experience.*
- **Animation:** Framer Motion - *For page transitions and UI micro-interactions.*
- **AI Integration:** Google Gemini API (via Vercel AI SDK or Google Vertex AI).
- **Database:** Supabase (PostgreSQL) + Prisma ORM (optional) or direct Supabase Client.
- **Auth:** Clerk or Supabase Auth.

---

## 📝 Coding Standards & Patterns

### 1. TypeScript & Type Safety
- **No `any`:** Ever. Use `unknown` if necessary and narrow the type.
- **Interfaces over Types:** Use `interface` for object definitions (better extensibility).
- **No Enums:** Use `const` assertions (`as const`) for cleaner compilation.
  ```typescript
  // DO THIS
  export const UserRole = {
    ADMIN: 'admin',
    USER: 'user'
  } as const;
  export type UserRole = (typeof UserRole)[keyof typeof UserRole];
  ```

### 2. React & Next.js Architecture
- **Server Components (RSC) First:** Logic lives on the server. `use client` is only for interactivity (onClick, onChange, hooks).
- **Server Actions:** Use Next.js Server Actions for all mutations (form submissions, AI triggers). Avoid API Routes (/pages/api) unless strictly necessary for webhooks.
- **Suspense & Streaming:** Wrap AI generation and heavy data fetches in `<Suspense>` boundaries with skeleton fallbacks.

### 3. UI/UX & Styling (The "Notion" Feel)
- **Tailwind First:** No CSS-in-JS. No .css files (except global.css).
- **Structure:**
  - Use flex and grid for layouts.
  - Use gap-* for spacing (never margins between siblings).
- **Animation:**
  - Use Framer Motion for entry animations on all major components.
  - Example: `<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>`

### 4. Code Structure & Naming
- **Directory Structure:**
  - `/app` (Routes)
  - `/components` (UI building blocks)
  - `/lib` (Utilities, AI helpers, DB clients)
  - `/types` (Shared interfaces)
- **Naming:**
  - Components: PascalCase (e.g., `StrategyCard.tsx`)
  - Functions: camelCase (e.g., `generateCampaign`)
  - Event Handlers: handle[Event] (e.g., `handleSubmit`, `handleClick`)
  - Files: kebab-case (e.g., `campaign-monitor.tsx`)

---

## 🤖 AI Implementation Guidelines (Gemini Specific)
- **Streaming:** Always stream AI text responses to the frontend to reduce perceived latency.
- **Structured Output:** When the AI generates a "Plan," force it to output JSON so we can map it to UI components (Kanban boards, Calendars), not just markdown text.
- **Context Injection:** Always include the "Growth Hub" templates in the system prompt before asking Gemini to generate content for the user.

---

## 🧠 Development Workflow (The Chain of Thought)
Before writing a single line of code, you must follow this process:

1. **Analyze:** Restate the user's request and identify the core technical challenge.
2. **Plan (Pseudocode):** Write out the component hierarchy and data flow.
   - Example: "I will create a server action that accepts the company URL, scrapes it, feeds it to Gemini, and returns a JSON object."
3. **Implementation:** Write the code in a single, complete pass.
4. **Review:**
   - Did I leave any placeholders? (If yes, fill them).
   - Is it accessible? (Add aria-labels).
   - Is it mobile responsive? (Check mobile views).

---

## 🚀 "Campus GTM" Specific Features to Maintain

### The Editor (/components/editor)
- Must use Tiptap.
- Must support a "Slash Command" menu (/) that triggers a popup to insert blocks.
- Blocks to support: Heading 1-3, Bullet List, Checklist, Quote, AI Block (custom block that triggers generation).

### The Onboarding Flow
- Must feel like a "Typeform" (one question at a time, smooth scroll).
- Store progress in URL params (nuqs) or LocalStorage to prevent data loss.

---

## 🛡️ Error Handling & Validation
- Use Zod for all schema validation (both form inputs and AI JSON outputs).
- Implement React Error Boundaries around feature-heavy components.
- Use toast notifications (Sonner or Shadcn Toast) for user feedback (Success/Error).

---

## 📋 Project Overview

### Project Name: Campus GTM (SaaS MVP)

**The Core Value Proposition:**
"The Notion for Go-To-Market."

A B2B SaaS platform that ingests unstructured company data (docs, brain dumps, website links), structures it against proven growth frameworks (The "Growth Hub"), and generates a live, editable, interactive GTM workspace.

### The Tech Stack Strategy
- **Framework:** Next.js 14 (App Router) – Standard for SaaS.
- **UI/UX:** Tailwind CSS + Shadcn/UI + Framer Motion (Crucial for that "smooth" feel).
- **Editor Engine:** Tiptap (Headless wrapper for ProseMirror). This is how you get the Notion-like inline editing, slash commands, and drag-and-drop blocks.
- **AI Engine:** Google Gemini 1.5 Pro (via Vertex AI or AI Studio).
  - **Why:** It has a 2 Million token context window. You don't need complex vector databases immediately. You can feed the entire "Growth Hub" template + the Company's Docs into the context window in one shot for perfect accuracy.
- **Database:** Supabase (PostgreSQL) + Prisma ORM.
- **Auth:** Clerk or Supabase Auth.

---

## 🏗️ Phase 1: The "Brain" & Data Structure (Backend)

We need to define what the AI is actually building. It isn't just generating text; it is generating Objects.

### 1. The Data Schema
Tell the AI builder to set up this schema:
- **Workspace:** The container for a company.
- **KnowledgeBase:** Stores the raw uploads (PDFs, CSVs) and the "Onboarding Interview" answers.
- **StrategyModules:** These are the containers for the output (e.g., "Student Ambassador Program," "Content Calendar," "ICP Definition").
- **Blocks:** The atomic unit of content (Text, Image, To-Do Checkbox, Kanban Card) — this allows the Notion-style editing.

### 2. The "Context Injection" Logic
We will use a System Prompt Architecture.
- **Input A:** Your "Growth Hub" Templates (The Golden Standard).
- **Input B:** User's Company Data (The Variable).
- **Process:** Gemini 1.5 Pro synthesizes A + B.
- **Output:** Structured JSON that maps to UI Blocks.

---

## 🎨 Phase 2: The "Notion" UI (Frontend)

This is where the "wow" factor lives. Do not use standard text areas.

### 1. The Editor (The Core Feature)
- Implement Tiptap editor.
- **Slash Command Menu:** Typing `/` triggers a Framer Motion popup to insert: "H1," "Bullet List," "AI Generator," "Marketing Table."
- **AI Autocomplete:** Like Notion AI or Cursor. Highlight text -> "Refine this for a Gen Z audience."

### 2. The Onboarding Flow ("The Hook")
- **Typeform-style Interface:** Smooth, animated transitions between questions.
- **Questions to ask:**
  - "Upload your Pitch Deck / Brand Guidelines."
  - "Who is your dream user?"
  - "What is your current MRR goal?"
  - "List 3 competitors."

---

## 🚀 Phase 3: The "Generators" (The Deliverables)

These are the specific API calls to Gemini that generate the "Strategy."

### The Ambassador Architect:
**Prompt:** "Based on [Company Uploads], design a 3-tier Student Ambassador program. Define the 'Scout', 'Captain', and 'Lead' roles, specific compensation (swag vs cash), and 5 key tasks for launch."

### The Content Matrix:
**Prompt:** "Generate a 4-week content calendar targeting [ICP]. Week 1: Awareness, Week 2: Education, Week 3: Social Proof, Week 4: Conversion. Format as a JSON array for a Kanban board."

### The Virality Engine:
**Prompt:** "Analyze [Product] against [Competitors]. Suggest 3 'Guerilla Marketing' tactics for a college campus hackathon."

---

## ⚠️ The "Copy-Paste" Build Prompts

Here are the specific prompts to feed your AI Builder (Claude Code / Cursor) to build this step-by-step.

### Step 1: Scaffold & UI Foundation
"Act as a Senior Frontend Architect. Initialize a Next.js 14 project with TypeScript, Tailwind, and Shadcn UI.

CRITICAL UI REQUIREMENT: I want a 'Notion-clone' feel.

Install framer-motion and tiptap.

Create a Layout component with a collapsible sidebar and a main content area.

Create a DocumentEditor component using Tiptap. It must support: H1-H3, Bullet lists, and a 'Slash Command' menu that floats near the cursor when '/' is typed.

Add smooth entry animations for all page loads using Framer Motion."

### Step 2: The Onboarding "Interviewer"
"Create an Onboarding Flow component.

It should not look like a standard form. It should look like a conversation.

Step 1: File Upload (PDF/Docx).
Step 2: 5 Text Inputs asking about ICP, Goals, and Competitors.

Store these answers in a React Context or LocalStorage for now.

Use a smooth 'slide-up' animation when moving to the next question."

### Step 3: The Gemini Integration (The Brain)
"Now, let's connect the brain.

Create a server action generateStrategy.ts.

Use the Google Gemini API (1.5 Pro).

The input should be the text from the Onboarding Flow.

The System Prompt is: 'You are a Y-Combinator level Growth Expert. You are building a Campus GTM strategy.'

The output should be formatted as Markdown.

Stream the response back to the frontend so the user sees the strategy typing out in real-time."

### Step 4: The "Strategy Modules"
"Create a dashboard view called 'The War Room'.

It should have cards for: 'Ambassador Playbook', 'Content Calendar', 'Outreach Scripts'.

When I click a card, it opens the DocumentEditor pre-filled with Gemini-generated content specific to that module.

For the 'Ambassador Playbook', prompt Gemini to create specific roles, requirements, and email onboarding templates."

---

## ✅ Feature Checklist for MVP Launch

| Feature | Complexity | Status |
|---------|-----------|--------|
| Auth (Login/Signup) | Low | ⬜ To Do |
| Doc Upload & Parsing | Med | ⬜ To Do |
| Chat-based Onboarding | Med | ⬜ To Do |
| Gemini API Connection | Low | ⬜ To Do |
| Notion-Style Editor (Tiptap) | High | ⬜ To Do |
| Ambassador Program Generator | Med | ⬜ To Do |
| Social Post Generator | Low | ⬜ To Do |
| Export to PDF/Notion | Low | ⬜ To Do |
