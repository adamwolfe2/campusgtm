# Campus GTM

**A Notion-style AI Copilot for Student Ambassador Programs**

> Modern, AI-powered platform for managing campus marketing and student ambassador programs with real-time collaboration, tracking, and analytics.

---

## Features

### 🎯 Core Features

- **AI-Powered Strategy Builder** - Generate marketing strategies with Anthropic, OpenAI, or Google Gemini
- **Real-time Collaboration** - Google Drive-style auto-refresh for workspace changes
- **Notion-Style Editor** - Rich text editing with TipTap for modules and content
- **Ambassador Tracking** - Short link system with analytics for tracking conversions
- **Live Notifications** - Real-time event system with toast notifications

### 🎨 Design System

- **coss ui** - Modern component library built on Base UI (Cal.com design system)
- **Prompt Kit** - AI-native components for chat, reasoning, and prompts
- **Fancy Components** - Motion-based animations and micro-interactions
- **Tailwind CSS v4** - CSS-first configuration with modern design tokens
- **Dark Mode** - Full dark mode support across all components

### 🔐 Authentication & Data

- **Clerk** - Secure authentication and user management
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row-Level Security** - Secure data access with RLS policies

### 📊 Analytics & Tracking

- **Tracking Links** - Short URL system for ambassador referrals
- **Click Analytics** - Track clicks, signups, and conversion rates
- **Leaderboards** - Ambassador performance tracking
- **Real-time Stats** - Live analytics dashboard

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | coss ui (Base UI) |
| **AI Components** | Prompt Kit |
| **Animations** | Fancy Components (Motion) |
| **Styling** | Tailwind CSS v4 |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Clerk |
| **AI** | Anthropic Claude, OpenAI GPT, Google Gemini |
| **Payments** | Stripe |
| **Editor** | TipTap |
| **Language** | TypeScript |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Supabase account
- Clerk account
- At least one AI provider API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/adamwolfe2/campusgtm.git
cd campusgtm
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AI Provider (at least one required)
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_GEMINI_API_KEY=your_gemini_key
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

---

## Project Structure

```
campusgtm/
├── app/                      # Next.js app router pages
│   ├── (auth)/              # Auth-protected routes
│   ├── api/                 # API routes
│   ├── workspace/[id]/      # Workspace pages
│   ├── ambassadors/         # Ambassador dashboard
│   ├── chat/                # AI chat interface
│   └── ...
├── components/
│   ├── ui/                  # coss ui components (Base UI)
│   ├── prompt-kit/          # Prompt Kit AI components
│   ├── fancy/               # Fancy Components (animations)
│   ├── editor/              # TipTap editor components
│   ├── chat-input.tsx       # AI chat components
│   └── ...
├── lib/
│   ├── database/            # Supabase client & queries
│   ├── ai/                  # AI provider integrations
│   └── utils.ts             # Utility functions
├── hooks/
│   ├── fancy/               # Fancy Components hooks
│   └── ...                  # Other React hooks
├── actions/                 # Server actions
└── supabase/               # Database schema & migrations
```

---

## Design Systems

### coss ui (Main Design System)

Built on Base UI with modern primitives:

```tsx
import { Button, Dialog, Card } from "@/components/ui/button"

<Button variant="default" size="lg">
  Click me
</Button>
```

**See:** [COSS_UI_MIGRATION.md](./COSS_UI_MIGRATION.md)

### Prompt Kit (AI Components)

AI-native components for chat and reasoning:

```tsx
import { PromptInput, ChainOfThought } from "@/components/prompt-kit/..."

<PromptInput onSubmit={handleSubmit}>
  <PromptInputTextarea placeholder="Ask anything..." />
</PromptInput>
```

**See:** [PROMPT_KIT_INTEGRATION.md](./PROMPT_KIT_INTEGRATION.md)

### Fancy Components (Animations)

Motion-based animations and micro-interactions:

```tsx
import ScrambleHover from "@/fancy/text/scramble-hover"
import Float from "@/fancy/blocks/float"

<Float speed={0.5} amplitude={[10, 30, 30]}>
  <h1>
    <ScrambleHover text="Campus GTM" />
  </h1>
</Float>
```

**See:** [UI_LIBRARIES_ANALYSIS.md](./UI_LIBRARIES_ANALYSIS.md)

---

## Key Features

### 1. Workspace System

Create collaborative workspaces with real-time updates:

- **Modules** - Strategy modules with rich text content
- **Real-time Sync** - Auto-refresh on changes from other users
- **Version History** - Track changes over time

### 2. Ambassador Program

Manage student ambassadors with tracking:

- **Tracking Links** - Short URLs for each ambassador
- **Analytics** - Click tracking, conversion rates, signup attribution
- **Leaderboards** - Performance rankings
- **Notifications** - Real-time updates on new signups

### 3. AI Strategy Builder

Generate marketing strategies with AI:

- **Multi-Provider Support** - Use Anthropic, OpenAI, or Google Gemini
- **Streaming Responses** - Real-time strategy generation
- **Customizable Prompts** - Tailor strategies to your needs

### 4. Real-time Notifications

Live updates across the platform:

- **Workspace Events** - Changes, comments, updates
- **Ambassador Activity** - New clicks, signups
- **System Messages** - Status updates, errors

---

## Database Schema

Key tables:

- `workspaces` - Workspace metadata
- `workspace_modules` - Strategy modules
- `workspace_events` - Real-time event log
- `tracking_links` - Ambassador referral links
- `link_clicks` - Click tracking
- `link_signups` - Signup attribution
- `journal_entries` - User reflection logs

**See:** `/supabase/schema.sql` for full schema

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

---

## Environment Variables

### Required

| Variable | Description | Provider |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk |

### AI Providers (at least one)

| Variable | Provider | Get Key |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Anthropic Claude | [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | OpenAI GPT | [platform.openai.com](https://platform.openai.com) |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini | [makersuite.google.com](https://makersuite.google.com) |

### Optional

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe payments |
| `NEXT_PUBLIC_APP_URL` | Application URL |

**See:** [.env.example](./.env.example) for full list

---

## Contributing

We welcome contributions! Please see our contributing guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Documentation

- [UI Libraries Analysis](./UI_LIBRARIES_ANALYSIS.md) - Complete guide to all three UI libraries
- [UI Rebuild Strategy](./UI_REBUILD_STRATEGY.md) - Detailed plan for UI enhancement
- [COSS UI Migration Guide](./COSS_UI_MIGRATION.md) - Complete coss ui integration details
- [Prompt Kit Integration](./PROMPT_KIT_INTEGRATION.md) - AI component usage guide
- [ROADMAP](./ROADMAP.md) - Product roadmap and feature pipeline

---

## License

ISC

---

## Support

- **Issues:** [GitHub Issues](https://github.com/adamwolfe2/campusgtm/issues)
- **Discussions:** [GitHub Discussions](https://github.com/adamwolfe2/campusgtm/discussions)

---

**Built with ❤️ for student ambassadors everywhere**
