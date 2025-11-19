# Campus GTM

**The Notion for Go-To-Market** — An AI-powered SaaS platform that automates Student Ambassador programs using Google Gemini.

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
- **AI Integration:** Google Gemini 1.5 Pro
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

4. Add your Google Gemini API key to `.env`:
```
GOOGLE_GEMINI_API_KEY=your_api_key_here
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
├── components/             # React components
│   ├── ui/                # Shadcn UI components
│   └── editor/            # Tiptap editor components
├── lib/                   # Utilities and helpers
├── types/                 # TypeScript type definitions
├── CLAUDE.md             # AI development rules and guidelines
└── .cursorrules          # Cursor IDE configuration
```

## Features (MVP)

- [ ] Auth (Login/Signup)
- [ ] Doc Upload & Parsing
- [ ] Chat-based Onboarding
- [ ] Gemini API Connection
- [ ] Notion-Style Editor (Tiptap)
- [ ] Ambassador Program Generator
- [ ] Social Post Generator
- [ ] Export to PDF/Notion

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