# Active Sits — Engineering Handover

A complete onboarding for the next engineer. Read this end-to-end on day one.

> **Security note.** This document deliberately contains **no actual secret values**. Every credential is referenced by name with the dashboard you fetch it from. Get the live secrets from Graham (`grahamriss17@gmail.com`) — either via a direct share of `.env.local`, a 1Password vault, or by rotating each one and grabbing the new value yourself.

---

## 1. What this is

**Active Sits** (active situations) is a professional M&A deals-intelligence platform at `sits.ctfnlighthouse.com`. The audience is merger-arbitrage investors, hedge funds, M&A lawyers, and financial advisors — not a consumer audience.

For each live deal it publishes:
- A structured snapshot card (status, next event, CTFN estimated close, key risks)
- Key Facts table (deal economics, advisors, votes, outside dates)
- Per-regulator filing cards with timelines and case URLs
- Shareholder vote progress (with voting agreements)
- CTFN's editorial analysis (target/acquirer/overlaps/synergies/competition/etc.)
- Background and commentary (verbatim from CTFN reports)
- Document library and shareholder activism log

Content is gated. Free visitors see the snapshot + a free preview. Paid subscribers see everything. There's also a single-deal-purchase option for non-subscribers who want one report.

---

## 2. Tech stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components by default. Client only where interactivity needs it. |
| CMS | Sanity v3 | Studio embedded at `/studio`. Project ID `cgq4vb5o`, dataset `production`. |
| Auth | Clerk | `@clerk/nextjs`. Roles: `admin`, `editor`, `viewer`. |
| Payments | Stripe | Subscriptions + single-deal purchases. Stripe Checkout + Customer Portal. **Decision: Stripe direct, NOT Clerk Billing.** |
| Email | Mailchimp Transactional (Mandrill) | Watchlist alerts. `mandrillapp.com` API. **Not** the regular Mailchimp Campaigns API. |
| Hosting | Vercel | Deploys on push to `main`. Custom domain `sits.ctfnlighthouse.com`. |
| Styling | Tailwind | Utility-first. No CSS-in-JS. |
| Lang | TypeScript | Strict mode. |

The project root has `CLAUDE.md` with the original design spec — read it after this doc for the full architectural rationale.

---

## 3. Where code lives

There are **two GitHub remotes** mirrored:

| Remote | URL | Purpose |
|---|---|---|
| `ctfn` | https://github.com/FahimCTFN/lighthouse-research | CTFN-org repo |
| `origin` | https://github.com/FahimMIST/lighthouse-active-sits | Personal mirror (also what Vercel deploys from — confirm in Vercel dashboard) |

Both remotes are kept in sync. Standard workflow: commit locally, push to both. The `.claude/settings.local.json` already permits `Bash(git push *)` so direct pushes work without a permission prompt.

Branches:
- `main` is the deployment branch (deploys on push)
- `remove-closing-probability` is a long-running feature branch from earlier work — was merged via PR; currently inactive
- Auto mode is allowed for routine changes; anything destructive needs explicit confirmation

---

## 4. Where the data lives

### Sanity CMS

**Where editors work:** `/studio` route on the live app, OR `https://cgq4vb5o.sanity.studio/` directly.

- Project ID: `cgq4vb5o`
- Dataset: `production`
- Schema: `schemas/deal.ts` (single document type called `deal`; richTextBlock + richTextWithImages helpers in `schemas/richText.ts`)
- Editorial roles set in Clerk public metadata: `role: "editor"` or `role: "admin"` to access Studio. Set manually from Clerk dashboard for now.

### Live deal data

13 active deals as of handover (May 2026). Each has structured filings + shareholder votes + CTFN analysis. Don't run `node scripts/seed.mjs` against production — it wipes everything. See §7 for the safe patch pattern.

### Local snapshot

`scripts/seed.mjs` is the original seed and a useful reference for "what should each deal look like." It's been kept loosely synced with live but **live is canonical now**, not seed. The seed is reliable for showing the shape of a deal but specific dates/outcomes will lag the live data. To get the current live state, query Sanity directly.

---

## 5. Credentials checklist

The full set of secrets you need to develop locally and ship to production. **Get the actual values from Graham — don't commit them.** The `.env.local` file is gitignored.

### `.env.local` template

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=                # dashboard.clerk.com → API keys
CLERK_SECRET_KEY=                                 # same — secret half
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=cgq4vb5o            # public — fine to commit, but kept here for completeness
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=                                 # sanity.io/manage → API → Tokens. Editor-scoped.
SANITY_WEBHOOK_SECRET=                            # arbitrary string; must match the webhook config in sanity.io/manage

# Stripe
STRIPE_SECRET_KEY=                                # dashboard.stripe.com → Developers → API keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=               # same — public half
STRIPE_WEBHOOK_SECRET=                            # Stripe → Webhooks → endpoint config
STRIPE_PAID_PRICE_ID=                             # Stripe → Products → the subscription price ID

# Mailchimp Transactional (Mandrill)
MANDRILL_API_KEY=                                 # mandrillapp.com → Settings → API Keys

# App
NEXT_PUBLIC_APP_URL=https://sits.ctfnlighthouse.com
```

### Where each lives in production

Vercel project → Settings → Environment Variables. The full list above must be set in Vercel for the live deploy to work. Preview environments share most of the same values, except potentially Stripe/Clerk where you may want test-mode keys for previews.

### Where each lives in dev

Your local `.env.local` file. Get the values from Graham via a secure share (1Password / direct file transfer). **Do not paste secrets into Slack, email, or chat.**

### Account ownership

| Service | Account | Notes |
|---|---|---|
| Sanity | Graham | He invites editors; admin role on `cgq4vb5o` project |
| Clerk | Graham | He sets up production instance; needs to add domain `sits.ctfnlighthouse.com` |
| Stripe | Graham | Needs business verification before going live |
| Vercel | Graham | Domain DNS managed here too |
| Mandrill | Graham | Sending domain `ctfnlighthouse.com` must be DKIM/SPF verified |
| GitHub | Both repos under FahimCTFN + FahimMIST orgs | Make sure new engineer is added as collaborator on both |

For any service Graham hasn't yet productionized, see the **go-live checklist** section.

---

## 6. Local dev setup

```bash
# 1. Clone
git clone https://github.com/FahimCTFN/lighthouse-research.git active-sits
cd active-sits

# 2. Add the second remote (so you can push to both)
git remote add origin https://github.com/FahimMIST/lighthouse-active-sits.git

# 3. Install
npm install

# 4. Drop in .env.local from Graham's secure share

# 5. Start the dev server
npm run dev
# → http://localhost:3000
# → http://localhost:3000/studio  (Sanity Studio embedded)
```

If Studio shows a CORS error, add `http://localhost:3000` to `sanity.io/manage → API → CORS origins` (with credentials enabled).

To deploy a Sanity schema change to the hosted Studio dashboard:

```bash
npx sanity deploy
# (only needed if editors use the standalone https://cgq4vb5o.sanity.studio URL)
```

For the embedded Studio at `/studio`, schema changes deploy automatically with the Next.js build.

---

## 7. Architecture (the things that surprised me)

### Three-layer content gating

1. **Middleware** (`middleware.ts`) — Clerk session + role check on every request. Redirects `/admin` and `/studio` for users without the right role; lets `/deals/[slug]` through and lets the page handle the UX.
2. **Conditional rendering** — the deal page passes `isPaid: boolean` down; child components render `<PaywallGate />` instead of content for unpaid users.
3. **GROQ query control** — paid sections (`regulatory_timeline`, `ctfn_analysis`, `documents`, etc.) are only fetched server-side after a paid check. Don't fetch everything and hide on the client.

### Two GROQ queries on the deal page

- `PUBLIC_DEAL_QUERY` — safe to run for any visitor, returns snapshot fields + free preview + minimal step data for the next-event derivation.
- `PAID_DEAL_QUERY` — only fetched after the server confirms `isSubscriber || ownsDeal` is true. Returns everything.

Both are in `lib/sanity/queries.ts`.

### Auto-advance "Next Key Event"

This is the one piece that's worth reading before you touch the deal page. See `lib/nextEvent.ts`.

The render-time `deriveNextKeyEvent(deal)` helper has this precedence:

1. **Manual override (Studio)** — if the editor sets both `next_key_event_date` and `next_key_event_label` in Studio AND the date is still future, that wins.
2. **Auto-derive** — otherwise, walks all pending filing/vote steps, skips ones from completed filings (cleared/blocked) or approved votes, and picks the earliest future expected date.
3. **Closing-target fallback** — `ctfn_estimated_close` as "Estimated close".
4. `null`.

So when a vote passes or a filing clears, the snapshot card auto-advances to the next pending step — the editor doesn't need to update anything. They only set `next_key_event_*` when they want to override (e.g. highlight a closing dinner or a media moment that isn't a regulatory step).

For the list/calendar/sort views (which fetch stored fields, not steps, to keep queries lean), there's a recompute helper:

```bash
node scripts/recompute-next-events.mjs           # only fills empty fields (respects manual overrides)
node scripts/recompute-next-events.mjs --force   # overwrites all (rarely needed)
```

### Regulator registry

`lib/regulators.ts` is a single source of truth for ~150 regulators across 60 countries. The Sanity dropdown, JURISDICTION_LABEL (full label), REGULATOR_SHORT (acronym), and the filing-card short-name helper all derive from this one array. Add a new regulator → one row, no scattered updates.

---

## 8. Editorial workflow

Editors live in Sanity Studio. Schema is in `schemas/deal.ts` — every field is documented inline with its `description`. Notable conventions:

- **Background field** — verbatim from CTFN report screenshots. *Never shorten or summarize.* Keep every paragraph, date, and party name. (I learned this the hard way.)
- **Key risk summary** — short, dense prose; renders prominently in the snapshot.
- **Filings** — each is a card. Use the proper jurisdiction enum from the registry; only use `Other` when nothing fits and explain in `display_name`.
- **Filing steps** — each step has a `label`, an optional `expected_date` and/or `actual_date`, and an optional `note`. When an event happens, **update the existing step's `actual_date`** in place; don't push a new "Vote passed" step (that creates duplicate "overdue" + "done" entries — see commit `c1a9a27` for the case study).
- **Shareholder vote outcomes** — once `outcome` flips to `approved`/`rejected`, the voting-agreements meter (`committed_pct` callout) hides automatically.
- **CTFN analysis** — sub-sections are independent rich-text fields. Empty sub-sections hide on the frontend.

---

## 9. Scripts and patches

The `scripts/` directory has two flavors:

### One-shot patches (`patch-*.mjs`)

Each is idempotent, narrowly scoped, and patches live Sanity. Pattern:

1. Fetch the specific deal(s) by `target` or `_id`.
2. Compute the change.
3. Skip if already applied (idempotency check).
4. Patch via `client.patch(_id).set({...}).commit()`.

Recent examples worth reading as templates:
- `patch-psky-wbd-fdi.mjs` — split a single filing into two (Germany BMWK + Slovenia MGTŠ FDI)
- `patch-other-jurisdictions.mjs` — bulk remap `Other` filings to proper enum values
- `patch-deal-refresh-2026-04-30.mjs` — multi-deal data refresh
- `patch-regulator-urls.mjs` — bulk-add `case_url` values

The cadence going forward: when news breaks for a deal, add a step or update an outcome via a patch script. Don't edit live data through Studio for time-sensitive updates if you can avoid it — patch scripts are auditable and idempotent; Studio edits aren't logged in the repo.

### Maintenance scripts

- `seed.mjs` — original full seed. **Wipes and recreates all deals.** Don't run against production.
- `recompute-next-events.mjs` — refresh stored `next_key_event_*` fields for the list/calendar views (see §7).

### Run pattern

```bash
node scripts/<name>.mjs
```

`SANITY_API_TOKEN` is read from `.env.local` automatically by the boilerplate at the top of each script.

---

## 10. Gotchas and conventions

A grab-bag of things that bit me:

- **Sanity Studio embedded page** must use `'use client'` and `export const dynamic = 'force-dynamic'`.
- **Stripe webhook handler** must use `await request.text()` (not `.json()`) to verify the signature before parsing.
- **Mandrill ≠ Mailchimp.** Different API endpoint (`mandrillapp.com`), different auth, different mental model.
- **Clerk `sessionClaims` over fresh API call** in middleware — fresh API calls add latency on every request.
- **ISR cache busting** — when a deal is published in Studio, the Sanity webhook hits `/api/alerts/send` which (besides emails) calls `revalidatePath('/deals/<slug>')` to bust the 60-second ISR cache. Without that, edits take up to 60s to show.
- **No fabricated dates.** When research can't confirm a specific date, leave it blank rather than guessing. UI handles `note`-only steps gracefully.
- **Regulator misapplications happen.** The PSKY/WBD "Germany & Slovenia / BKartA" entry was wrong on two levels — the agencies were BMWK and MGTŠ (FDI), not BKartA, and it was FDI not antitrust. When in doubt, look at the agency category in `lib/regulators.ts` and verify against the actual filing source.
- **Sanity field deletes** — if you remove a field from the schema, Sanity keeps existing data as orphan fields. They don't render but stay in the doc. That's usually fine; if you need to actually delete, write a migration script.

---

## 11. Open / parked work

### Lighthouse Feed (planned, ~5-6 hr build)

A news-wire feature for CTFN editorial — short news items, free-to-read initially, gated later. Schema and UI designed but not implemented. Memory note: `~/.claude/projects/-Users-fahim-Documents-active-sits/memory/project_lighthouse_feed.md`.

### Live spread feature (parked)

Designed but parked because it needs a market-data API (Polygon or IEX) and `exchange_ratio` schema fields. The design considers showing the live arb spread between target's market price and offer price. Memory note: `project_live_spread.md`.

### Production go-live (~2.5 hrs of config)

Everything that needs to switch from test/preview to production. Checklist lives in memory: `project_go_live_checklist.md`. Roughly:

1. Rotate all credentials (Clerk, Sanity, Stripe)
2. Switch Clerk to production instance + add custom domain
3. Switch Stripe to live mode + new webhook
4. Configure Sanity webhook → `/api/alerts/send`
5. Verify Mandrill sending domain (DKIM/SPF on `ctfnlighthouse.com`)
6. Vercel domain + env vars
7. Post-launch smoke tests (sign-up → subscribe → unlock → unfollow → cancel)

---

## 12. Common tasks

| Task | How |
|---|---|
| Add a new deal | Sanity Studio → "Deal" → fill all required fields. The slug auto-generates from acquirer + target. |
| Update a filing outcome | Studio works for most edits, but for time-sensitive updates write a `patch-*.mjs` script and check it in. Idempotent. |
| Refresh stored next-event fields | `node scripts/recompute-next-events.mjs` |
| Trigger ISR for a single deal | Either edit the deal in Studio (fires the webhook) or wait 60s |
| Deploy a code change | Push to `main` on either remote. Vercel auto-deploys from origin. |
| Run a Sanity migration | Write a one-off `scripts/migrate-*.mjs`. Use the `client.fetch + patch` pattern. |
| Test the paywall | Sign in as a non-paid user, visit a deal slug, confirm `<PaywallGate />` shows. Subscribe via Stripe test mode and confirm content unlocks. |
| Add a regulator | One row in `lib/regulators.ts`. Schema dropdown, labels, and short names all derive from it. |
| Email an alert | Editor publishes a deal update with `trigger_alert: true` in Studio → Sanity webhook → `/api/alerts/send` → Mandrill emails everyone watching. |

---

## 13. Repo map

```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                       Index — deal list + filter bar
│   │   ├── deals/[slug]/page.tsx          Individual deal page (the heart of the product)
│   │   ├── subscribe/page.tsx             Subscription page
│   │   ├── sign-in/[[...sign-in]]/...
│   │   └── sign-up/[[...sign-up]]/...
│   ├── (protected)/account/page.tsx       Watchlist + account management
│   ├── admin/page.tsx                     Admin panel (admin role only)
│   ├── studio/[[...tool]]/page.tsx        Embedded Sanity Studio (editor/admin only)
│   ├── calendar/page.tsx                  Regulatory event calendar
│   ├── archive/page.tsx                   Closed/terminated deals
│   └── api/
│       ├── stripe/{webhook,create-checkout-session,buy-report,portal}/route.ts
│       ├── watchlist/{follow,unfollow}/route.ts
│       ├── alerts/send/route.ts           ← Sanity webhook target
│       ├── auth/check/route.ts
│       ├── search/route.ts
│       └── admin/users/route.ts
├── components/
│   ├── deals/
│   │   ├── SnapshotCard.tsx               Status / next-event / CTFN close / key risks
│   │   ├── KeyFactsTable.tsx              Economics + advisors + outside dates
│   │   ├── RegulatoryFilings.tsx          Per-regulator filing cards
│   │   ├── ShareholderVote.tsx            Vote progress + voting agreements
│   │   ├── CtfnAnalysis.tsx               Editorial sub-sections
│   │   ├── DocumentLibrary.tsx
│   │   ├── ShareholderActivism.tsx
│   │   ├── PaywallGate.tsx                Replaces locked sections for free users
│   │   ├── DealHeader.tsx
│   │   ├── DealCard.tsx                   Index card
│   │   ├── DealCardLocked.tsx
│   │   ├── KeyRiskPull.tsx
│   │   ├── UpdateBanner.tsx
│   │   ├── CollapsibleProse.tsx
│   │   └── CheckoutSuccess.tsx
│   ├── filters/
│   │   ├── FilterBar.tsx
│   │   ├── FilterPopover.tsx
│   │   └── useFilters.ts
│   ├── layout/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   └── SubscriptionBanner.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── FollowButton.tsx
├── lib/
│   ├── sanity/{client,queries,types}.ts
│   ├── clerk/helpers.ts
│   ├── stripe/{client,helpers}.ts
│   ├── mailchimp/sendAlert.ts
│   ├── regulators.ts                      ← single source of truth for ~150 regulators
│   ├── filings.ts                         Filing helpers (annotateSteps, outcome labels)
│   ├── nextEvent.ts                       ← derive Next Key Event with override + auto-derive
│   ├── calendar.ts                        Calendar event-builder
│   └── format.ts                          Date/price/percent formatters + STAGE_COLORS
├── middleware.ts                          Clerk + role + paid gating
├── sanity.config.ts
├── schemas/
│   ├── deal.ts                            ← schema for the only document type
│   └── richText.ts                        Portable Text block + image block helpers
├── scripts/
│   ├── seed.mjs                           Original seed (DESTRUCTIVE — wipes all)
│   ├── recompute-next-events.mjs          Refresh stored next_key_event_* fields
│   ├── patch-*.mjs                        ~20 idempotent one-shot patches
└── HANDOVER.md                            ← you are here
```

---

## 14. People

| Person | Role | Contact |
|---|---|---|
| Graham Riss | Owner / product | grahamriss17@gmail.com |
| CTFN editorial desk | Content | via Graham |

---

## 15. First-week onboarding checklist

- [ ] Get added to both GitHub repos (FahimCTFN + FahimMIST)
- [ ] Get the live `.env.local` from Graham (or rotate + re-share)
- [ ] Get added to the Sanity project as an editor
- [ ] Get added to Clerk dashboard as admin (so you can grant other users)
- [ ] Get added to Stripe (as developer), Mandrill (as user), Vercel (as collaborator)
- [ ] Clone the repo, run `npm install`, run `npm run dev`, open localhost:3000
- [ ] Sign up locally, sign in, navigate to a deal, confirm paywall
- [ ] Try `node scripts/recompute-next-events.mjs` — it should be a no-op if everything's current
- [ ] Read `CLAUDE.md` (architectural intent), then `lib/nextEvent.ts` and `schemas/deal.ts` (the most "novel" code)
- [ ] Walk through the most recent 5 commits with `git log --stat -p` to see how patches are structured
- [ ] If anything in this doc is wrong or stale, edit it and commit

Welcome aboard.
