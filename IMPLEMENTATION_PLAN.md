# Campus GTM - Complete Full-Stack Build Checklist

## 🎯 Goal
Build 100% of backend logic, data flows, and page infrastructure BEFORE v0 UI polish.
Test everything with Playwright to ensure it works.

---

## ✅ COMPLETED (Phase 1-3)

### Core Infrastructure
- [x] Next.js 14 + TypeScript setup
- [x] Tailwind CSS + Shadcn UI
- [x] Model-agnostic AI architecture
- [x] AI provider settings UI
- [x] Workspace storage (localStorage)
- [x] Block-based rendering system

### AI & Generation
- [x] Multi-provider AI integration (OpenAI, Anthropic, Google)
- [x] Strategy orchestrator (onboarding → AI → workspace)
- [x] GTM strategy generation (structured output)
- [x] 5 strategy modules (Ambassador, Content, ICP, Outreach, Virality)

### Content Systems
- [x] Tiptap editor with slash commands
- [x] Web scraper (company URL analysis)
- [x] File upload & parsing (PDF, DOCX, TXT)
- [x] Conversational onboarding flow

### Pages
- [x] Landing page (`/`)
- [x] Dashboard (`/dashboard`)
- [x] Settings (`/settings`)
- [x] Onboarding (`/onboarding`)
- [x] Workspace view (`/workspace/[id]`)

---

## 🚧 IN PROGRESS (Phase 4: Full-Stack Completion)

### Database & Persistence
- [ ] Install and configure Supabase client
- [ ] Create database schema (SQL migrations)
  - [ ] Users table
  - [ ] Workspaces table
  - [ ] StrategyModules table
  - [ ] Blocks table
  - [ ] OnboardingData table
- [ ] Replace localStorage with Supabase
- [ ] Database CRUD service layer
- [ ] Real-time subscriptions (optional)

### Authentication
- [ ] Install Clerk or Supabase Auth
- [ ] Login page (`/login`)
- [ ] Signup page (`/signup`)
- [ ] Protected routes middleware
- [ ] User profile management
- [ ] Session handling
- [ ] OAuth providers (Google, GitHub)

### Missing Pages
- [ ] Individual module editor (`/workspace/[id]/module/[moduleId]`)
- [ ] Export page/modal (PDF, Notion, Markdown)
- [ ] Sharing page (`/share/[workspaceId]`)
- [ ] Onboarding results/preview before generation
- [ ] Error pages (404, 500)
- [ ] Help/Documentation page

### Editor Enhancements
- [ ] Save editor content to database
- [ ] Real-time auto-save
- [ ] Version history
- [ ] AI inline assistance (highlight text → AI suggestions)
- [ ] Custom AI block (generate content inline)
- [ ] Drag-and-drop block reordering
- [ ] Block comments/annotations

### Workspace Features
- [ ] Edit workspace metadata (name, company)
- [ ] Delete workspace
- [ ] Duplicate workspace
- [ ] Archive workspace
- [ ] Workspace settings
- [ ] Collaboration (invite team members)
- [ ] Activity log

### Strategy Module Features
- [ ] Edit individual modules
- [ ] Regenerate module with AI
- [ ] Custom module creation
- [ ] Module templates library
- [ ] Export individual module
- [ ] Share module publicly

### AI Features
- [ ] AI chat interface (ask questions about strategy)
- [ ] Dynamic follow-up questions in onboarding
- [ ] AI suggestions based on industry
- [ ] Competitive analysis enhancement
- [ ] Personalization based on past workspaces
- [ ] AI feedback on strategy execution

### Export & Integration
- [ ] Export to PDF (with branding)
- [ ] Export to Notion
- [ ] Export to Markdown
- [ ] Export to Google Docs
- [ ] Email strategy as PDF
- [ ] Slack integration
- [ ] Calendar integration (for content calendar)

### Analytics & Tracking
- [ ] Workspace analytics dashboard
- [ ] Strategy execution tracking
- [ ] Ambassador program metrics
- [ ] Content calendar completion
- [ ] Goal progress tracking
- [ ] Custom KPIs

### Admin & Management
- [ ] Admin dashboard
- [ ] User management
- [ ] Usage analytics
- [ ] API key management (if offering hosted AI)
- [ ] Billing/subscriptions (Stripe)
- [ ] Rate limiting

### Testing
- [ ] Playwright E2E tests for all flows
- [ ] Unit tests for AI orchestrator
- [ ] Integration tests for database
- [ ] API route tests
- [ ] Error handling tests

### Performance & Optimization
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Caching strategy
- [ ] CDN setup
- [ ] Database indexing

### Security
- [ ] API key encryption
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Input validation (all forms)
- [ ] SQL injection prevention

---

## 📋 PRIORITY ORDER (Next 48 Hours)

### Priority 1: Database Integration (Critical)
1. **Install Supabase**
   - Create project
   - Get credentials
   - Install client SDK

2. **Create Schema**
   - Design tables (users, workspaces, modules, blocks)
   - Write migrations
   - Seed data

3. **Replace localStorage**
   - Create database service layer
   - Update all storage calls
   - Test data persistence

### Priority 2: Authentication (Critical)
1. **Install Clerk**
   - Set up project
   - Add API keys
   - Configure providers

2. **Build Auth Pages**
   - Login page
   - Signup page
   - Password reset

3. **Protect Routes**
   - Add middleware
   - Redirect logic
   - User context

### Priority 3: Missing Pages (High)
1. **Module Editor** (`/workspace/[id]/module/[moduleId]`)
   - Load module from database
   - Render blocks in Tiptap editor
   - Save changes
   - AI regeneration button

2. **Export Modal**
   - PDF generation
   - Download functionality
   - Email option

3. **Error Pages**
   - 404 with navigation
   - 500 with retry
   - Maintenance mode

### Priority 4: Editor Enhancements (High)
1. **Auto-save**
   - Debounced save on change
   - Save indicator
   - Conflict resolution

2. **AI Inline**
   - Highlight text → menu
   - "Improve", "Shorten", "Expand"
   - Stream response inline

3. **Custom AI Block**
   - Slash command `/ai`
   - Prompt input
   - Generate and insert

### Priority 5: Testing (High)
1. **Set up Playwright**
   - Configure browsers
   - Write base helpers

2. **Critical Flow Tests**
   - Onboarding → generation → display
   - Settings → save API key
   - Dashboard → workspace navigation

3. **Edge Case Tests**
   - No API key configured
   - Network failures
   - Invalid inputs

---

## 🎬 Playwright Test Plan

### Test Suites

#### 1. Onboarding Flow
- [ ] Navigate to /onboarding
- [ ] Fill all 9 questions
- [ ] Upload a file
- [ ] Enter website URL
- [ ] Complete and wait for generation
- [ ] Verify redirect to workspace
- [ ] Assert strategy modules rendered

#### 2. Settings Flow
- [ ] Navigate to /settings
- [ ] Add Google Gemini API key
- [ ] Toggle provider on
- [ ] Save settings
- [ ] Verify localStorage updated
- [ ] Test with invalid key (error handling)

#### 3. Dashboard Flow
- [ ] Navigate to /dashboard
- [ ] Verify workspace list renders
- [ ] Click workspace card
- [ ] Verify navigation to workspace
- [ ] Click "New Strategy" button
- [ ] Verify redirect to onboarding

#### 4. Workspace View
- [ ] Navigate to workspace
- [ ] Verify all 5 modules render
- [ ] Verify blocks display correctly
- [ ] Test back to dashboard button

#### 5. Editor (when implemented)
- [ ] Open module editor
- [ ] Type content
- [ ] Use slash commands
- [ ] Insert blocks
- [ ] Verify auto-save

---

## 🛠 Implementation Strategy

### Phase 4A: Database (Days 1-2)
1. Set up Supabase
2. Create schema
3. Migrate storage layer
4. Test persistence

### Phase 4B: Authentication (Days 3-4)
1. Install Clerk
2. Build auth pages
3. Protect routes
4. User management

### Phase 4C: Missing Features (Days 5-7)
1. Module editor
2. Export functionality
3. AI enhancements
4. Error pages

### Phase 4D: Testing & Polish (Days 8-10)
1. Write Playwright tests
2. Fix bugs found
3. Performance optimization
4. Security hardening

### Phase 4E: Final Review (Day 11)
1. End-to-end testing
2. Documentation
3. Deployment prep
4. Handoff to v0 for UI polish

---

## 📊 Success Metrics

### Functionality
- [ ] 100% of user flows work without errors
- [ ] All data persists correctly
- [ ] AI generation works reliably
- [ ] No broken links or routes

### Testing
- [ ] 90%+ Playwright test coverage
- [ ] All critical paths tested
- [ ] Error scenarios handled

### Performance
- [ ] <2s page load times
- [ ] <5s AI generation time
- [ ] Smooth animations (60fps)

### Code Quality
- [ ] Zero TypeScript errors
- [ ] Zero console errors
- [ ] All components documented
- [ ] Clean git history

---

**Next Steps:**
1. Install Playwright MCP
2. Start with Database integration
3. Test each feature as built
4. Build comprehensive test suite
