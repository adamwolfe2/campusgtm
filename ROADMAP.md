# Campus GTM - Strategic Roadmap & Action Plan

**Date:** November 19, 2024
**Status:** Pre-Launch (MVP 98% Complete)
**Goal:** Transform MVP into a polished, commercial-grade SaaS product.

---

## 🗺️ Executive Summary

Campus GTM is currently a functional MVP with a solid architectural foundation. The core "AI Strategy Generation" loop works, data persistence is handled via Supabase, and the editor is functional.

**The Gap:** The difference between the current state and a sellable product is **"Consumer-Grade Polish"** and **"Commercial Infrastructure"** (Billing, Teams, Admin).

This roadmap outlines the 4 phases to bridge this gap.

---

## 🎨 Phase 1: Visual Fidelity (The "Notion" Polish)
**Objective:** Make the app indistinguishable from a premium tool like Notion or Linear.
**Reference:** `DESIGN.md`

### 1.1 Typography & Spacing Audit
- [ ] **Global Font Stack:** Ensure `inter` or system sans-serif is applied with correct tracking (-0.01em).
- [ ] **Heading Hierarchy:** Enforce `DESIGN.md` scale:
  - H1: 40px (Bold 700)
  - H2: 32px (Semibold 600)
  - H3: 24px (Semibold 600)
- [ ] **Whitespace:** Replace arbitrary margins with the 4px grid system (`space-y-4`, `gap-2`).
- [ ] **Text Colors:** Standardize all text to:
  - Primary: `#37352F` (Notion Black)
  - Secondary: `#787774` (Notion Grey)
  - Tertiary: `#9B9A97` (Notion Light Grey)

### 1.2 Component Refinement
- [ ] **Buttons:** Update `components/ui/button.tsx` to match Notion buttons:
  - Height: 32px (sm) / 40px (md)
  - Radius: 4px (sm) / 6px (md)
  - Shadow: `shadow-sm` (not `shadow-md`)
  - Hover: `bg-[#EFEFEF]` for ghost variants.
- [ ] **Cards:** Update `components/ui/card.tsx`:
  - Border: `1px solid #E3E2E0`
  - Shadow: `0 1px 2px rgba(0,0,0,0.04)` (Subtle)
  - Hover: Lift -2px with `transition-all duration-200 ease-out-expo`.
- [ ] **Sidebar:**
  - Ensure active state has the correct light grey background (`#F1F1EF`).
  - Verify icon sizes are exactly 20x20px.

### 1.3 Animation Polish (Framer Motion)
- [ ] **Page Transitions:** Implement `<AnimatePresence mode="wait">` wrapper in `layout.tsx`.
- [ ] **Micro-interactions:**
  - Buttons: Scale 0.98 on click.
  - Dropdowns: Scale 0.95 -> 1.00 + Fade In (150ms).
  - Modals: Slide up 10px + Fade In (250ms).

---

## 🛠️ Phase 2: Feature Completion (The Missing 2%)
**Objective:** Close all functional gaps identified in the audit.

### 2.1 Editor Enhancements
- [ ] **AI Block:** Implement the "Magic Block" in Tiptap.
  - Type `/ai` -> Opens input -> Streams text into editor.
- [ ] **Image Upload:**
  - Add drag-and-drop handler to editor.
  - Upload to Supabase Storage bucket `workspace-assets`.
  - Insert as optimized `<img>` node.

### 2.2 Export Engine
- [ ] **PDF Generation:**
  - Style the PDF output to match the screen (clean typography).
  - Add company branding (Logo + Name) to header.
- [ ] **Markdown Export:** Ensure all Tiptap nodes map correctly to MD syntax.

### 2.3 Onboarding Polish
- [ ] **Empty States:** Design a "First Run" experience for the dashboard.
- [ ] **Loading Skeletons:** Replace spinners with shimmering block skeletons for the editor and dashboard cards.

---

## 💰 Phase 3: Commercialization (The "Sellable" Layer)
**Objective:** Add infrastructure to charge money and manage users.

### 3.1 Billing & Subscriptions (Stripe)
- [ ] **Pricing Page:** `/pricing` with 3 tiers (Starter, Growth, Campus).
- [ ] **Stripe Integration:**
  - Checkout Sessions for subscriptions.
  - Webhook handler (`/api/webhooks/stripe`) to update Supabase.
  - Customer Portal for billing management.
- [ ] **Gating:** Middleware to check subscription status before allowing AI generation.

### 3.2 Team Management
- [ ] **Invites:** Allow users to invite colleagues via email.
- [ ] **Roles:** Admin vs. Editor vs. Viewer.
- [ ] **Workspace Switching:** UI to toggle between different team workspaces.

### 3.3 Admin Dashboard (Internal)
- [ ] **Metrics:** Total users, MRR, Active Workspaces.
- [ ] **User Management:** Ability to ban users or refund payments.

---

## 🛡️ Phase 4: Production Hardening
**Objective:** Ensure stability, security, and scalability.

### 4.1 Security & Performance
- [ ] **Rate Limiting:** Implement `upstash/ratelimit` on AI endpoints (e.g., 10 requests/min).
- [ ] **Content Safety:** Add moderation check (OpenAI Moderation API) before saving content.
- [ ] **Database Indexing:** Verify indices on `workspace_id` and `user_id` for all tables.

### 4.2 Analytics & Monitoring
- [ ] **PostHog / Mixpanel:** Track "Strategy Generated", "Exported PDF", "Invited User".
- [ ] **Sentry:** Catch frontend and backend errors in production.

### 4.3 Testing
- [ ] **E2E Suite:** Write 5 critical Playwright tests:
  1. Sign Up -> Onboarding -> Generate Strategy.
  2. Edit Document -> Save.
  3. Invite Member -> Accept Invite.

---

## 📋 Immediate "Next Steps" Checklist

1. **[UI]** Apply `inter` font and correct text colors globally.
2. **[UI]** Refine `Button` and `Card` components to match `DESIGN.md`.
3. **[Feat]** Implement the `AI Block` in the editor.
4. **[Infra]** Set up Stripe test mode.

---

**Approved By:** Campus GTM Architecture Team
**Version:** 1.0.0
