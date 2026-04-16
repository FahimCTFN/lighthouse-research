# CTFN Lighthouse — Active Sits Platform
## Claude Code Project Instructions

This file tells Claude Code everything it needs to know to build this project correctly.
Read this fully before writing any code.

---

## What We Are Building

A professional M&A deals intelligence web platform at `sits.ctfnlighthouse.com`.

The product is called **Active Sits** (active situations). It publishes structured intelligence on live M&A deals — combining a structured data card per deal with editorial commentary, regulatory timelines, and key documents. Content is gated: free visitors see a snapshot card and a short editorial preview; paid subscribers see everything.

The audience is merger arbitrage investors, hedge funds, M&A lawyers, and financial advisors. The tone of the UI should reflect that — clean, data-dense, professional. Not a blog. Not a consumer app.

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Use server components by default. Client components only where interactivity requires it. |
| CMS | Sanity v3 | Headless. Studio embedded at `/studio`. All deal content lives here. |
| Auth | Clerk | Handles sign up, sign in, session, roles. Use `@clerk/nextjs`. |
| Payments | Stripe | Subscriptions only. Use Stripe Checkout and Customer Portal. |
| Email | Mailchimp Transactional (Mandrill) | Triggered watchlist alert emails only. Not broadcast campaigns. |
| Hosting | Vercel | App Router + edge middleware. Custom domain `sits.ctfnlighthouse.com`. |
| Styling | Tailwind CSS | Utility-first. No CSS-in-JS. |
| Language | TypeScript | Strict mode. No `any` types. |

---

## Project Structure

```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  ← Active Sits index (deal list)
│   │   ├── deals/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          ← Individual deal page
│   │   ├── subscribe/
│   │   │   └── page.tsx              ← Subscription / upgrade page
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx
│   ├── (protected)/
│   │   └── account/
│   │       └── page.tsx              ← Watchlist + account management
│   ├── admin/
│   │   └── page.tsx                  ← Admin panel (admin role only)
│   ├── studio/
│   │   └── [[...tool]]/
│   │       └── page.tsx              ← Sanity Studio embed (editor role only)
│   └── api/
│       ├── stripe/
│       │   └── webhook/
│       │       └── route.ts          ← Stripe webhook handler
│       ├── watchlist/
│       │   ├── follow/route.ts
│       │   └── unfollow/route.ts
│       └── alerts/
│           └── send/route.ts         ← Sanity webhook triggers this
├── components/
│   ├── deals/
│   │   ├── DealCard.tsx              ← Card used on index page
│   │   ├── DealCardLocked.tsx        ← Locked state for non-paid users
│   │   ├── SnapshotCard.tsx          ← Structured data card on deal page
│   │   ├── RegulatoryTimeline.tsx    ← Paid content section
│   │   ├── CtfnAnalysis.tsx          ← Paid content section
│   │   ├── DocumentLibrary.tsx       ← Paid content section
│   │   ├── UpdateLog.tsx             ← Paid content section
│   │   └── PaywallGate.tsx           ← Shown in place of locked sections
│   ├── filters/
│   │   ├── FilterBar.tsx             ← Filter + sort controls on index
│   │   └── useFilters.ts             ← Filter state hook
│   ├── layout/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   └── SubscriptionBanner.tsx    ← CTA for non-logged-in visitors
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── FollowButton.tsx
├── lib/
│   ├── sanity/
│   │   ├── client.ts                 ← Sanity client config
│   │   ├── queries.ts                ← All GROQ queries
│   │   └── types.ts                  ← TypeScript types for deal schema
│   ├── stripe/
│   │   ├── client.ts
│   │   └── helpers.ts                ← Check subscription status
│   ├── clerk/
│   │   └── helpers.ts                ← Get user role, check paid status
│   └── mailchimp/
│       └── sendAlert.ts              ← Send watchlist alert email
├── middleware.ts                     ← Route protection + subscription gating
├── sanity.config.ts                  ← Sanity Studio config
├── schemas/                          ← Sanity document schemas
│   └── deal.ts
└── .env.local                        ← Never commit this
```

---

## Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=                     # Read/write token for server-side queries
SANITY_WEBHOOK_SECRET=                # For verifying incoming Sanity webhooks

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PAID_PRICE_ID=                 # The price ID for the paid subscription

# Mailchimp Transactional (Mandrill)
MANDRILL_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://sits.ctfnlighthouse.com
```

---

## Sanity Deal Schema

Build the schema exactly as specified. Every field matters — the frontend depends on this structure.

```typescript
// schemas/deal.ts
export const deal = {
  name: 'deal',
  title: 'Deal',
  type: 'document',
  fields: [
    // Identity
    { name: 'acquirer', title: 'Acquirer', type: 'string', validation: (R) => R.required() },
    { name: 'target', title: 'Target', type: 'string', validation: (R) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: (doc) => `${doc.acquirer}-${doc.target}` }, validation: (R) => R.required() },
    {
      name: 'status', title: 'Deal Status', type: 'string',
      options: { list: ['announced','regulatory_review','hsr_waiting','proxy_filed','vote_scheduled','closing_imminent','closed','terminated','archived'] },
      validation: (R) => R.required()
    },
    {
      name: 'sector', title: 'Sector', type: 'string',
      options: { list: ['technology','healthcare','financial_services','energy','consumer','industrials','other'] },
      validation: (R) => R.required()
    },

    // Deal Economics (Snapshot Card — visible to all)
    { name: 'equity_value', title: 'Equity Value (USD millions)', type: 'number' },
    { name: 'offer_price', title: 'Offer Price (USD per share)', type: 'number' },
    { name: 'premium', title: 'Premium (%)', type: 'number' },
    { name: 'termination_fee', title: 'Termination Fee (USD millions)', type: 'number' },
    { name: 'termination_fee_notes', title: 'Termination Fee Notes', type: 'string' },

    // CTFN Proprietary Fields (Snapshot Card — visible to all)
    { name: 'ctfn_closing_probability', title: 'CTFN Closing Probability (0–100)', type: 'number', validation: (R) => R.min(0).max(100) },
    { name: 'ctfn_estimated_close', title: 'CTFN Estimated Close Date', type: 'date' },
    { name: 'ctfn_probability_notes', title: 'Probability Notes (internal)', type: 'text' },

    // Dates
    { name: 'announcement_date', title: 'Announcement Date', type: 'date' },
    { name: 'next_key_event_date', title: 'Next Key Event Date', type: 'date' },
    { name: 'next_key_event_label', title: 'Next Key Event Label', type: 'string' },

    // Content — FREE (visible to all)
    { name: 'free_preview', title: 'Free Preview', type: 'array', of: [{ type: 'block' }] },

    // Content — PAID (paid subscribers only)
    {
      name: 'regulatory_timeline', title: 'Regulatory Timeline', type: 'array',
      of: [{
        type: 'object', name: 'timeline_event',
        fields: [
          { name: 'date', type: 'date', title: 'Date' },
          { name: 'jurisdiction', type: 'string', title: 'Jurisdiction', options: { list: ['DOJ','FTC','EU','CMA','CFIUS','Court','Other'] } },
          { name: 'event_type', type: 'string', title: 'Event Type' },
          { name: 'description', type: 'text', title: 'Description' },
          { name: 'status', type: 'string', title: 'Status', options: { list: ['pending','filed','approved','blocked','withdrawn'] } },
        ]
      }]
    },
    { name: 'ctfn_analysis', title: 'CTFN Analysis', type: 'array', of: [{ type: 'block' }] },
    { name: 'risk_factors', title: 'Risk Factors', type: 'array', of: [{ type: 'block' }] },

    // Documents — PAID
    {
      name: 'documents', title: 'Deal Documents', type: 'array',
      of: [{
        type: 'object', name: 'deal_document',
        fields: [
          { name: 'title', type: 'string', title: 'Document Title' },
          { name: 'document_type', type: 'string', title: 'Document Type', options: { list: ['merger_agreement','proxy_statement','hsr_filing','ftc_doj_filing','eu_cma_submission','court_filing','press_release','investor_presentation','other'] } },
          { name: 'file', type: 'file', title: 'PDF File', options: { accept: 'application/pdf' } },
          { name: 'upload_date', type: 'date', title: 'Upload Date' },
          { name: 'description', type: 'string', title: 'Description' },
        ]
      }]
    },

    // Update Log — PAID
    {
      name: 'update_log', title: 'Update Log', type: 'array',
      of: [{
        type: 'object', name: 'update_entry',
        fields: [
          { name: 'timestamp', type: 'datetime', title: 'Timestamp' },
          { name: 'summary', type: 'string', title: 'Update Summary (shown in alert emails)' },
          { name: 'updated_by', type: 'string', title: 'Updated By' },
        ]
      }]
    },

    // Alert Controls
    { name: 'trigger_alert', title: 'Send Watchlist Alert on Publish', type: 'boolean', initialValue: false },
    { name: 'alert_summary', title: 'Alert Email Summary (max 280 chars)', type: 'string', validation: (R) => R.max(280) },
  ],
  preview: {
    select: { title: 'acquirer', subtitle: 'target', status: 'status' },
    prepare({ title, subtitle, status }) {
      return { title: `${title} → ${subtitle}`, subtitle: status }
    }
  }
}
```

---

## Content Gating — How It Works

There are three layers. Build all three. Do not skip any.

### Layer 1 — Middleware (the real security gate)

`middleware.ts` runs on the edge before anything renders. It must:

- Check Clerk session on every request to `/deals/[slug]`, `/account`, `/admin`, `/studio`
- Check whether the user has an active Stripe subscription (stored as a Clerk public metadata field `stripeSubscriptionStatus`)
- If accessing a route that requires paid access and the user is not paid → do not redirect, just let them through to the page (the page handles the UX). Only hard-redirect for `/account` if not logged in at all.
- Hard-redirect `/admin` to `/` if user does not have `admin` role in Clerk
- Hard-redirect `/studio` to `/` if user does not have `editor` or `admin` role in Clerk

### Layer 2 — Conditional Rendering (UX gate)

On the deal page, check subscription status server-side in the page component. Pass `isPaid: boolean` as a prop to child components. Paid content sections (`RegulatoryTimeline`, `CtfnAnalysis`, `DocumentLibrary`, `UpdateLog`) render their content if `isPaid === true`, or render `<PaywallGate />` if false.

**Critical:** Never fetch paid content from Sanity if the user is not paid. The GROQ query itself should only request paid fields when the user is authenticated and paid. Do not fetch everything and then hide it on the client.

### Layer 3 — Sanity query control

Write two GROQ queries for the deal page:

```typescript
// Public query — safe to run for any visitor
export const PUBLIC_DEAL_QUERY = groq`
  *[_type == "deal" && slug.current == $slug][0] {
    acquirer, target, status, sector,
    equity_value, offer_price, premium, termination_fee, termination_fee_notes,
    ctfn_closing_probability, ctfn_estimated_close,
    announcement_date, next_key_event_date, next_key_event_label,
    free_preview
  }
`

// Paid query — only call this after confirming paid status server-side
export const PAID_DEAL_QUERY = groq`
  *[_type == "deal" && slug.current == $slug][0] {
    ...,
    regulatory_timeline, ctfn_analysis, risk_factors,
    documents, update_log
  }
`
```

---

## Stripe Integration

### Subscription flow

1. User clicks Subscribe → POST to `/api/stripe/create-checkout-session`
2. Server creates Stripe Checkout session with `success_url` pointing back to the deal page they came from
3. On success, Stripe fires `customer.subscription.created` webhook
4. Webhook handler at `/api/stripe/webhook/route.ts` verifies signature, then updates the user's Clerk metadata:

```typescript
await clerkClient.users.updateUserMetadata(clerkUserId, {
  publicMetadata: {
    stripeSubscriptionStatus: 'active',
    stripeCustomerId: stripeCustomerId,
    stripeSubscriptionId: subscriptionId,
  }
})
```

5. Middleware and server components read `stripeSubscriptionStatus` from Clerk metadata to gate content

### Webhook events to handle

| Event | Action |
|---|---|
| `customer.subscription.created` | Set `stripeSubscriptionStatus: 'active'` in Clerk metadata |
| `customer.subscription.updated` | Update status accordingly |
| `customer.subscription.deleted` | Set `stripeSubscriptionStatus: 'cancelled'` |
| `invoice.payment_failed` | Set `stripeSubscriptionStatus: 'past_due'` |

### Grace period

On `invoice.payment_failed`, do not immediately revoke access. Set status to `past_due`. Only set to `cancelled` on `customer.subscription.deleted`. Stripe retries failed payments automatically.

---

## Watchlist & Email Alerts

### Watchlist storage

Store watchlist state in Clerk user metadata (public metadata `watchlist: string[]` — array of deal slugs). This avoids needing a separate database for V1.

```typescript
// Follow a deal
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    watchlist: [...currentWatchlist, dealSlug]
  }
})
```

### Alert trigger flow

1. Editor publishes a deal update in Sanity with `trigger_alert: true`
2. Sanity fires a webhook to `/api/alerts/send`
3. The API route:
   - Verifies the Sanity webhook secret
   - Fetches all Clerk users whose `watchlist` array contains the updated deal slug
   - For each matching user, sends a Mailchimp Transactional (Mandrill) email

### Mailchimp Transactional email

Use the Mandrill API (not Mailchimp Campaigns API). The trigger is per-user, not a broadcast.

```typescript
// lib/mailchimp/sendAlert.ts
const response = await fetch('https://mandrillapp.com/api/1.0/messages/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: process.env.MANDRILL_API_KEY,
    message: {
      subject: `Update: ${acquirer} → ${target}`,
      from_email: 'alerts@ctfnlighthouse.com',
      from_name: 'CTFN Lighthouse',
      to: [{ email: userEmail, type: 'to' }],
      html: alertEmailHtml,
      text: alertEmailText,
    }
  })
})
```

---

## Admin Panel

Route: `/admin` — hard-redirect to `/` for anyone without `admin` Clerk role.

The admin panel is a server component that fetches data from Clerk and Stripe APIs directly. It does not use a separate database.

### What to build

**Subscriber stats (top of page)**
- Total registered users → Clerk API `clerkClient.users.getCount()`
- Active paid subscribers → filter users where `publicMetadata.stripeSubscriptionStatus === 'active'`
- New sign-ups in last 7 days and 30 days

**User management table**
- Search by email using Clerk API
- Show: name, email, join date, subscription status
- Actions: Grant paid access (set metadata manually), Revoke access, Set expiry date

**Deal health panel**
- Count of active deals from Sanity
- Deals not updated in 7+ days → flag these for editorial attention

**Manual access grant**
When admin grants manual access, write to Clerk metadata:
```typescript
publicMetadata: {
  stripeSubscriptionStatus: 'active',
  manualAccessGrant: true,
  manualAccessExpiry: '2026-12-31',  // optional
}
```

---

## Roles

Roles are set in Clerk's `publicMetadata.role` field. Three values: `admin`, `editor`, `viewer`.

```typescript
// How to check role in a server component
const { sessionClaims } = auth()
const role = sessionClaims?.metadata?.role
const isAdmin = role === 'admin'
const isEditor = role === 'editor' || role === 'admin'
```

Set roles manually from the Clerk dashboard for now. No self-serve role assignment in V1.

---

## UI & Design Direction

The platform serves financial professionals. The UI must feel like a professional data terminal, not a blog or SaaS marketing site.

### Principles

- **Data-dense but not cluttered.** Use tables and structured layouts, not prose cards.
- **Monochrome base with one accent colour.** Dark navy or deep charcoal with a single accent (deep amber or electric blue). No rainbow data visualisations.
- **Typography is functional.** A clean geometric sans (e.g. IBM Plex Sans, DM Sans, or Geist) for body. Numbers should be tabular (`font-variant-numeric: tabular-nums`) so columns align.
- **Deal stage badges must be immediately readable.** Use consistent colour coding: Announced = blue, Regulatory Review = amber, Closing Imminent = green, Terminated = red.
- **No decorative illustrations or stock imagery.**
- **Tables over cards for data-heavy views** (especially regulatory timeline, update log).

### Tailwind config additions

```javascript
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-geist-mono)', 'monospace'],
    },
    colors: {
      brand: {
        navy: '#0B1426',
        accent: '#F0A500',
      }
    }
  }
}
```

### Deal stage colour map

```typescript
export const STAGE_COLORS: Record<string, string> = {
  announced:          'bg-blue-100 text-blue-800',
  regulatory_review:  'bg-amber-100 text-amber-800',
  hsr_waiting:        'bg-amber-100 text-amber-800',
  proxy_filed:        'bg-purple-100 text-purple-800',
  vote_scheduled:     'bg-purple-100 text-purple-800',
  closing_imminent:   'bg-green-100 text-green-800',
  closed:             'bg-gray-100 text-gray-600',
  terminated:         'bg-red-100 text-red-800',
  archived:           'bg-gray-100 text-gray-400',
}
```

---

## Index Page — Filtering Logic

Filters live in the URL as query params so views are shareable. Use `useSearchParams` and `useRouter` for client-side filter state.

```
/?stage=regulatory_review&sector=technology&days=14&sort=next_event
```

Fetch all active deals from Sanity (status not `archived`) in a single query. Do all filtering client-side in a `useFilters` hook — no separate API call per filter change.

Index page should use **ISR with a 60-second revalidation** so it stays fast but reflects new deals within a minute.

```typescript
export const revalidate = 60
```

---

## Build Order

Follow this exact order. Each phase depends on the previous.

1. **Sanity schema + Studio** — `schemas/deal.ts`, `sanity.config.ts`, test with dummy deal data
2. **Next.js base** — project init, Tailwind, folder structure, layout (`Nav`, `Footer`)
3. **Clerk auth** — sign-up, sign-in pages, session provider, middleware skeleton
4. **Stripe integration** — checkout session route, webhook handler, metadata sync
5. **Gating middleware** — complete `middleware.ts`, role checks for `/admin` and `/studio`
6. **Index page** — deal list, `DealCard`, `DealCardLocked`, `FilterBar`, ISR
7. **Deal page** — `SnapshotCard`, `PaywallGate`, all paid content sections
8. **Watchlist + alerts** — follow/unfollow API routes, Mandrill integration, Sanity webhook
9. **Admin panel** — subscriber stats, user management, deal health
10. **Custom domain** — Vercel domain config, DNS CNAME for `sits.ctfnlighthouse.com`
11. **QA + editorial onboarding** — test full subscriber flow end to end, onboard editors to Sanity Studio

---

## What Not To Build (V1 Scope)

Do not build any of these unless explicitly asked:

- Native mobile app
- Public API for deal data
- Full-text search
- Team / firm-level subscriptions (single seat only)
- Multi-currency pricing
- Comments or community features
- Integration with Bloomberg, Reuters, or any external data feeds
- Bulk document downloads

---

## Key Decisions Already Made

- Email provider: **Mailchimp Transactional (Mandrill)** — not Resend, not SendGrid
- Auth: **Clerk** — not NextAuth, not Supabase Auth
- CMS: **Sanity** — not Contentful, not WordPress
- Hosting: **Vercel** — not AWS, not Railway
- No separate database — Clerk metadata handles watchlist and subscription state for V1
- Watchlist is paid-only — free members cannot follow deals

---

## Common Gotchas

- Always use `sanity.config.ts` at root level, not inside `app/`
- Sanity Studio page must use `'use client'` and `export const dynamic = 'force-dynamic'`
- Stripe webhook handler must use `await request.text()` (not `.json()`) to verify signature before parsing
- Clerk middleware must run before everything — place `matcher` to include all routes except static assets
- When reading Clerk metadata in middleware, use `sessionClaims` not a fresh API call (avoids latency)
- Use `revalidatePath()` or `revalidateTag()` in the Sanity webhook handler to bust ISR cache when a deal is published
- Mailchimp Transactional is a separate product from Mailchimp — uses `mandrillapp.com` API endpoint, not `api.mailchimp.com`