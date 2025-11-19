# Campus GTM

**The Notion for Go-To-Market** — An AI-powered SaaS platform that automates Student Ambassador programs with model-agnostic AI integration.

## Overview

Campus GTM is a Notion-style AI Copilot that ingests unstructured company data (docs, brain dumps, website links), structures it against proven growth frameworks (The "Growth Hub"), and generates a live, editable, interactive GTM workspace.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI (Radix Primitives)
- **Icons:** Lucide React
- **Editor Engine:** Tiptap (Notion-like editing experience)
- **Animation:** Framer Motion
- **AI Integration:** Model-Agnostic (OpenAI, Anthropic, Google Gemini) via Vercel AI SDK
- **Database:** Supabase (PostgreSQL) + Prisma ORM
- **Auth:** Clerk or Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd campusgtm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure AI providers (choose one or more):

**Option A: Via Settings UI (Recommended)**
- Run the dev server and navigate to Settings
- Add your API key(s) for any supported provider
- Keys are stored locally and never sent to our servers

**Option B: Via Environment Variables**
Add your API key(s) to `.env`:
```bash
# Choose one or more providers
GOOGLE_GEMINI_API_KEY=your_key_here        # Recommended: 2M token context
ANTHROPIC_API_KEY=your_key_here            # Best reasoning
OPENAI_API_KEY=your_key_here               # Versatile with images
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
campusgtm/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   └── settings/          # AI provider configuration
├── components/             # React components
│   ├── ui/                # Shadcn UI components
│   └── editor/            # Tiptap editor components (upcoming)
├── lib/                   # Utilities and helpers
│   └── ai/                # AI abstraction layer
│       ├── service.ts     # High-level AI operations
│       ├── provider-factory.ts  # Model instantiation
│       └── config.ts      # Configuration management
├── types/                 # TypeScript type definitions
│   ├── index.ts           # Core types
│   └── ai.ts              # AI-specific types
├── CLAUDE.md             # AI development rules and guidelines
└── .cursorrules          # Cursor IDE configuration
```

## Model-Agnostic AI Architecture

Campus GTM supports **multiple AI providers** so you can choose the best model for your needs:

### Supported Providers

| Provider | Best For | Context Window | Key Features |
|----------|----------|----------------|--------------|
| **Google Gemini** ⭐ | Document-heavy strategies | 2M tokens | Massive context, cost-effective |
| **Anthropic Claude** | Strategic reasoning | 200K tokens | Superior analysis, nuanced output |
| **OpenAI GPT** | Versatile generation | 128K tokens | Image generation, widely supported |

### Why Model-Agnostic?

1. **Flexibility:** Switch providers without changing code
2. **Cost Control:** Use different models for different tasks
3. **Future-Proof:** Easy to add new providers as they emerge
4. **User Choice:** Let users bring their own API keys
5. **No Vendor Lock-in:** Not dependent on a single provider

### How It Works

The AI layer uses the **Vercel AI SDK** to provide a unified interface:

```typescript
// Automatic provider selection based on user settings
const strategy = await generateGTMStrategy(request, userConfig);

// Works seamlessly with any configured provider
```

All AI operations support:
- ✅ Streaming responses (real-time UI updates)
- ✅ Structured output (JSON generation with Zod schemas)
- ✅ Error handling and rate limiting
- ✅ Token usage tracking

## Features (MVP)

### Core Infrastructure
- [x] Model-agnostic AI architecture
- [x] AI provider configuration UI
- [x] Dashboard layout with sidebar navigation
- [ ] Auth (Login/Signup)

### AI & Strategy Generation
- [x] Multi-provider AI integration (OpenAI, Anthropic, Google)
- [x] Streaming text generation
- [x] Structured output with Zod schemas
- [ ] Conversational onboarding flow
- [ ] GTM strategy generator
- [ ] Ambassador program builder
- [ ] Content calendar generator
- [ ] ICP definition tool

### Content & Editing
- [ ] Notion-style editor (Tiptap)
- [ ] Slash command menu
- [ ] Inline AI assistance
- [ ] Doc upload & parsing
- [ ] Export to PDF/Notion

### Marketing Deliverables
- [ ] Social post generator
- [ ] Outreach script templates
- [ ] Virality tactics generator

## Development Philosophy

This project follows strict coding standards:

- **No `any` types** — Use `unknown` and narrow types properly
- **Interfaces over Types** — Better extensibility
- **Server Components First** — Use `"use client"` only when needed
- **Tailwind First** — No CSS-in-JS or separate CSS files
- **Consumer-Grade Polish** — Smooth animations, clean typography, instant interactivity

See [CLAUDE.md](./CLAUDE.md) for complete development guidelines.

## License

ISC