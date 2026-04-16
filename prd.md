# Product Requirements Document

## CTFN Lighthouse — Active Situations (Active Sits) Web Platform

**Version:** 1.0  
**Status:** Draft  
**URL:** sits.ctfnlighthouse.com  
**Last Updated:** April 2026

---

## 1. Executive Summary

CTFN Lighthouse is a professional-grade M&A deals intelligence platform targeting merger arbitrage investors, institutional funds, M&A lawyers, and financial advisors. The Active Sits product (`sits.ctfnlighthouse.com`) is a structured web reader that publishes real-time deal intelligence on active M&A situations — combining structured data cards with editorial commentary and key deal documents.

The platform replaces ad-hoc publishing workflows (email, PDFs, spreadsheets) with a single, gated destination that serves both free and paid subscribers, while giving the CTFN editorial team a clean CMS-driven workflow for publishing and updating deals.

---

## 2. Problem Statement

Merger arbitrage professionals need timely, structured intelligence on active deals — including regulatory timelines, closing probability estimates, and key filings — but current information is fragmented across SEC filings, news wires, and subscription terminals. There is no single destination that combines:

- Structured deal data (pricing, premium, termination fee, closing probability)
- Expert editorial analysis from the CTFN team
- Key deal documents in one place
- Real-time update alerts as situations evolve

CTFN has the editorial expertise and proprietary analysis. This platform gives it a proper distribution channel and monetisation layer.

---

## 3. Goals & Success Metrics

### Primary Goals

- Launch a fully functional web reader for active M&A situations
- Convert free readers into paid subscribers through progressive content gating
- Give the editorial team a fast, structured publishing workflow
- Establish `sits.ctfnlighthouse.com` as a trusted destination for merger arb intelligence

### Success Metrics (first 6 months post-launch)

- 500+ registered free members
- 100+ paying subscribers
- Average deal updated within 24 hours of a material development
- Editorial team able to publish a new deal in under 30 minutes
- Watchlist email alerts delivered within 15 minutes of a deal update

---

## 4. Target Users

### 4.1 Subscribers (End Users)

| Segment                               | Profile                                               | Primary Need                                                          |
| ------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| Institutional investors / hedge funds | Merger arb desks, event-driven funds                  | Real-time deal intelligence, closing probability, regulatory timeline |
| Retail / individual investors         | Self-directed investors running merger arb strategies | Structured deal data without Bloomberg terminal cost                  |
| M&A lawyers & advisors                | Deal counsel, financial advisors on transactions      | Regulatory status, key documents, timeline tracking                   |

### 4.2 Internal Users (Editorial Team)

| Role        | Responsibilities                                                             |
| ----------- | ---------------------------------------------------------------------------- |
| Admin (you) | Full platform access, user management, subscription overrides, all content   |
| Editor      | Create, edit, and publish deal entries; upload documents; update deal fields |
| Viewer      | Read-only access to Sanity Studio drafts; cannot publish                     |

---

## 5. Information Architecture

```
sits.ctfnlighthouse.com/
├── /                        ← Active Sits Index (deal list)
├── /deals/[slug]            ← Individual Deal Page
├── /account                 ← Subscriber account & watchlist management
├── /subscribe               ← Subscription / upgrade page
├── /sign-in                 ← Authentication
├── /sign-up                 ← Registration
├── /studio                  ← Sanity Studio (editors only)
└── /admin                   ← Admin panel (admin only)
```

---

## 6. Feature Requirements

### 6.1 Active Sits Index Page

**Purpose:** The homepage. Displays all currently active deals as a filterable, sortable grid of deal cards.

#### Deal Card (Index View)

Each card displays the following regardless of membership tier:

- Acquirer name and Target name
- Deal stage badge (e.g. Announced, Regulatory Review, Proxy Filed, Closing Imminent)
- Sector tag
- Offer price and premium
- CTFN closing probability (shown as a percentage or confidence indicator)
- Estimated closing date / CTFN estimate
- Days until next key event
- Last updated timestamp

**Locked state (free / not logged in):** Card is visible with all above fields shown but a "Paid" lock icon overlaid on the card body. Clicking the card takes the user to the deal page where they see the free preview and hit the paywall.

**Unlocked state (paid):** Full card visible, clicking goes to the full deal page.

#### Filters & Sorting

| Filter           | Type         | Options                                                                                   |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------- |
| Deal Stage       | Multi-select | Announced, Regulatory Review, Proxy Filed, Vote Scheduled, Closing Imminent               |
| Sector           | Multi-select | Technology, Healthcare, Financial Services, Energy, Consumer, Industrials, Other          |
| Next Event       | Toggle       | Within 7 days / Within 14 days / Within 30 days                                           |
| CTFN Probability | Range slider | 0–100%                                                                                    |
| Sort             | Dropdown     | Most Recently Updated, Next Event Date (soonest), Deal Value (largest), Premium (highest) |

Filters persist in the URL (query params) so users can share filtered views.

#### Empty & Loading States

- Skeleton loading cards while data fetches
- Empty state message when filters return no results
- "Sign up free" CTA banner for non-logged-in visitors

---

### 6.2 Individual Deal Page

**Purpose:** The full intelligence report for a single M&A situation.

#### Layout Structure

```
[Deal Header]
  Acquirer → Target | Deal Stage Badge | Sector Tag | Last Updated

[Snapshot Card]  ← Visible to ALL (free, paid, not logged in)
  Equity Value | Offer Price | Premium | Termination Fee
  CTFN Closing Probability | CTFN Estimated Close Date
  Deal Stage | Announcement Date

[Free Preview]  ← Visible to ALL
  2–3 paragraph editorial summary
  Key background context

--- PAYWALL GATE (for free / non-members) ---

[Regulatory Timeline]  ← Paid only
  Chronological timeline of regulatory events
  Status indicators (Pending / Filed / Approved / Blocked)
  Jurisdiction tags (DOJ, FTC, EU, CMA, CFIUS, etc.)

[CTFN Analysis]  ← Paid only
  Full editorial commentary and analyst take
  Risk factors
  Historical comparables

[Key Deal Documents]  ← Paid only
  Linked document library (uploaded PDFs)
  Document type labels (Merger Agreement, Proxy Statement, HSR Filing, Court Filing, etc.)
  Upload date and description

[Deal Update History]  ← Paid only
  Timestamped log of all updates to this deal entry
```

#### Paywall Component (non-paying visitors)

Shown in place of locked content sections. Contains:

- Brief description of what is locked
- List of 3–4 bullet points of what paid subscribers get
- "Subscribe from $X/month" CTA button
- "Sign in" link for existing paid subscribers

---

### 6.3 Authentication & Membership

#### User States

| State                                                    | Access Level                                                           |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| Not logged in                                            | Index page (locked cards), Deal page snapshot card + free preview only |
| Free member (registered, not subscribed)                 | Same as above — registration captures email for marketing              |
| Paid subscriber (active Stripe subscription)             | Full access to all deal content, documents, watchlist, alerts          |
| Lapsed subscriber (Stripe subscription cancelled/failed) | Graceful downgrade — shown re-subscribe prompt, loses paid access      |

#### Auth Flows

- Sign up via email/password or Google OAuth
- Magic link sign-in option
- Password reset flow
- On subscription: Stripe Checkout → return to deal page that triggered the upgrade prompt
- On cancellation: Stripe Customer Portal (self-serve, no code required)

---

### 6.4 Watchlist & Email Alerts

#### Watchlist

- Paid subscribers can "follow" individual deals from the deal page or index
- Watchlist accessible from `/account` — shows followed deals in a compact list
- Easy unfollow from watchlist or deal page

#### Email Alerts

Triggered when a deal the subscriber is watching is updated. Alert email contains:

- Deal name (Acquirer → Target)
- What changed (editor-authored update summary, max 2–3 sentences)
- Link to the deal page
- Quick unfollow link at the bottom of the email

Alert delivery target: within 15 minutes of a deal being published/updated in Sanity.

**Technical note:** Email sending via Mailchimp Transactional (formerly Mandrill). Triggered by Sanity webhook → Next.js API route → Mailchimp Transactional API. Watchlist alert emails are sent as transactional messages, not campaign broadcasts. A Mailchimp Transactional add-on is required on top of a standard Mailchimp plan.

---

### 6.5 Deal Lifecycle

**Active deals** are the default state. All active deals appear on the index page.

**Closing / Termination window:** When a deal closes or terminates, it remains visible on the platform for up to 2 weeks in a "Closed" or "Terminated" status. After 2 weeks, the deal is archived — removed from the main index but accessible via direct URL and internal search.

**Deal stages (ordered):**

1. Announced
2. Regulatory Review
3. HSR Waiting Period
4. Proxy Filed
5. Vote Scheduled
6. Closing Imminent
7. Closed _(2-week visibility window)_
8. Terminated _(2-week visibility window)_
9. Archived _(off index, accessible by URL)_

---

### 6.6 Subscription & Billing

#### Plans

| Tier | Price                          | Access                                          |
| ---- | ------------------------------ | ----------------------------------------------- |
| Free | $0                             | Registration, snapshot card, free preview       |
| Paid | TBD (monthly + annual options) | Full deal content, documents, watchlist, alerts |

#### Billing Mechanics

- Stripe Checkout for new subscriptions
- Stripe Customer Portal for cancellation, card updates, invoice history
- Webhook handler for subscription lifecycle events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Grace period: 3 days on failed payment before access is revoked
- On lapse: user sees "Resubscribe" prompt, not a generic error

#### Admin Subscription Overrides

From the admin panel, admin can:

- Manually grant paid access to a user (e.g. comps, press, investors)
- Set an expiry date on manual grants
- Revoke paid access immediately

---

### 6.7 Admin Panel (`/admin`)

Accessible only to users with the `admin` role in Clerk.

#### Sections

**Subscriber Overview**

- Total registered users
- Total active paid subscribers
- New subscribers (last 7 / 30 days)
- Recent sign-ups table (name, email, tier, joined date)

**User Management**

- Search users by email
- View user profile: tier, join date, Stripe status
- Grant / revoke manual paid access
- Set access expiry date

**Deal Overview**

- Count of active deals
- Deals updated in last 24 hours
- Deals with no update in 7+ days (flagged for editorial attention)

---

### 6.8 Sanity Studio (`/studio`)

The editorial CMS. Accessible to editors and admins only (Clerk role gate).

#### Deal Document Schema

```
Deal {
  // Identity
  title                   String (auto-generated: "Acquirer → Target")
  slug                    String (auto-generated, editable)
  status                  Enum: announced | regulatory_review | hsr_waiting |
                               proxy_filed | vote_scheduled | closing_imminent |
                               closed | terminated | archived

  // Parties
  acquirer                String
  target                  String
  sector                  Enum: technology | healthcare | financial_services |
                               energy | consumer | industrials | other

  // Deal Economics (Snapshot Card)
  equity_value            Number (USD millions)
  offer_price             Number (USD per share)
  premium                 Number (percentage)
  termination_fee         Number (USD millions)
  termination_fee_notes   String (optional context)

  // CTFN Proprietary Fields
  ctfn_closing_probability  Number (0–100)
  ctfn_estimated_close      Date
  ctfn_probability_notes    String (internal, not displayed publicly)

  // Dates
  announcement_date       Date
  next_key_event_date     Date
  next_key_event_label    String (e.g. "FTC decision expected")

  // Content (Gated)
  free_preview            Rich Text (Portable Text)
  regulatory_timeline     Array of Timeline Events {
                            date, jurisdiction, event_type, description, status
                          }
  ctfn_analysis           Rich Text (Portable Text)
  risk_factors            Rich Text (Portable Text)

  // Documents
  documents               Array of Deal Documents {
                            title, document_type, file (PDF upload), upload_date, description
                          }

  // Update Log
  update_log              Array of Update Entries {
                            timestamp, summary (short text), updated_by
                          }

  // Alert Trigger
  trigger_alert           Boolean (checkbox — when ticked on publish, sends watchlist emails)
  alert_summary           String (max 280 chars — text used in the alert email)
}
```

#### Editorial Workflow

1. Editor opens Sanity Studio at `/studio`
2. Creates new Deal document — fills in structured fields
3. Writes free preview (rich text)
4. Writes full analysis, regulatory timeline, risk factors (paid content)
5. Uploads key documents as PDFs
6. Sets `trigger_alert: false` for first publish (no alert on initial creation)
7. Publishes deal — immediately live on site

**On deal update:**

1. Editor opens existing deal
2. Makes changes
3. Adds an entry to the update log with a brief summary
4. If material update: ticks `trigger_alert` and writes `alert_summary`
5. Publishes — update goes live, alert emails sent to watchlist subscribers

---

### 6.9 Document Library

Each deal can have multiple attached documents. Supported types:

- Merger Agreement
- Proxy Statement / Definitive Proxy
- HSR Filing
- FTC / DOJ Filing
- EU / CMA Submission
- Court Filing
- Press Release
- Investor Presentation
- Other

Documents are uploaded as PDFs to Sanity's asset library. On the deal page, they display as a clean list with document type, title, upload date, and a download/view link. Documents are behind the paid gate.

---

## 7. Non-Functional Requirements

### 7.1 Performance

- Index page initial load: under 2 seconds (via Next.js static generation with ISR)
- Deal page load: under 2 seconds
- Filter interactions: under 300ms (client-side, no re-fetch)
- Alert email delivery: within 15 minutes of publish

### 7.2 Security

- All paid content served only after server-side session verification via Next.js middleware
- No paid content ever in the DOM for non-paying users (not just CSS-hidden)
- Sanity Studio and Admin panel behind Clerk role gates
- Stripe webhooks verified via webhook signature

### 7.3 Availability

- Target 99.9% uptime via Vercel
- No single point of failure — Sanity and Clerk are independently hosted

### 7.4 Mobile Responsiveness

- Full responsive design — deal cards, deal pages, and watchlist all fully functional on mobile
- Email alerts designed mobile-first

### 7.5 SEO

- Deal pages publicly indexable (snapshot card + free preview visible to crawlers)
- Open Graph metadata per deal page (deal name, summary, CTFN branding)
- Sitemap auto-generated

---

## 8. Tech Stack

| Layer    | Tool                        | Purpose                                            |
| -------- | --------------------------- | -------------------------------------------------- |
| Frontend | Next.js (App Router)        | Pages, routing, server components, middleware      |
| CMS      | Sanity (with Sanity Studio) | Deal content, document uploads, editorial workflow |
| Auth     | Clerk                       | User authentication, roles, session management     |
| Payments | Stripe                      | Subscriptions, billing, customer portal            |
| Email    | Mailchimp                   | Transactional emails + watchlist alert delivery    |
| Hosting  | Vercel                      | Deployment, CDN, custom domain                     |
| Domain   | sits.ctfnlighthouse.com     | Via CNAME to Vercel                                |

---

## 9. Content Gating Architecture

### Three-Layer Approach

**Layer 1 — Next.js Middleware (Security Gate)**
Runs on the edge before any page renders. Checks Clerk session for subscription status. Any request to a paid API route without a valid paid session returns 401. This is the true security layer — no paid content reaches the client without passing this check.

**Layer 2 — Conditional Rendering (UX Gate)**
React components on the deal page check subscription status and conditionally render either the paid content sections or the paywall component. This controls the user experience — what they see vs. the upgrade prompt.

**Layer 3 — Sanity Content Structure (Editorial Gate)**
Free preview and paid content are separate fields in the Sanity schema. The API only returns paid content fields to authenticated, paying users. This ensures paid content is never accidentally exposed in the response payload.

---

## 10. User Flows

### 10.1 New Visitor → Paid Subscriber

1. Lands on index page (via search, referral, newsletter)
2. Sees locked deal cards — clicks a deal
3. Sees snapshot card + free preview
4. Hits paywall — clicks "Subscribe"
5. Goes to `/subscribe` page — selects plan
6. Stripe Checkout → payment
7. Redirected back to the deal page they were on
8. Full deal now visible

### 10.2 Paid Subscriber Updating Watchlist

1. Logs in → browses index
2. Opens a deal → clicks "Follow this deal"
3. Deal added to watchlist
4. Editor updates the deal and ticks `trigger_alert`
5. Subscriber receives email alert within 15 minutes
6. Clicks link → lands on updated deal page

### 10.3 Editor Publishing a New Deal

1. Logs into Sanity Studio at `/studio`
2. Creates new Deal document
3. Fills in all structured fields (economics, dates, probability)
4. Writes free preview and full paid content sections
5. Uploads relevant documents
6. Sets deal status to "Announced"
7. Leaves `trigger_alert` unchecked (no alert on first publish)
8. Clicks Publish → deal live on site immediately

### 10.4 Admin Granting Manual Access

1. Logs into admin panel at `/admin`
2. Searches user by email
3. Clicks "Grant Paid Access"
4. Sets optional expiry date
5. Saves — user immediately has full paid access

---

## 11. Out of Scope (V1)

The following are explicitly excluded from the initial build and flagged for future consideration:

- Native mobile app (iOS / Android)
- Public API for deal data
- Embeddable deal widgets for third-party sites
- Comments or community features
- Multi-currency subscription pricing
- Team / firm-level subscriptions (single user only in V1)
- Full-text search across deal content
- Bulk document downloads
- Custom report generation
- Integration with Bloomberg or Reuters feeds

---

## 12. Milestones & Build Order

| Phase | Deliverable                                | Est. Duration |
| ----- | ------------------------------------------ | ------------- |
| 1     | Sanity schema + Studio setup               | Week 1        |
| 2     | Next.js project structure, routing, layout | Week 1–2      |
| 3     | Clerk auth (sign up, sign in, roles)       | Week 2        |
| 4     | Stripe integration + webhook handler       | Week 2–3      |
| 5     | Content gating middleware + logic          | Week 3        |
| 6     | Index page + deal card components          | Week 3–4      |
| 7     | Deal page + paywall component              | Week 4        |
| 8     | Watchlist + Resend alert emails            | Week 5        |
| 9     | Admin panel                                | Week 5–6      |
| 10    | Custom domain setup + production deploy    | Week 6        |
| 11    | Editorial team onboarding + QA             | Week 6–7      |

---

## 13. Open Questions

The following decisions are deferred and should be resolved before or during build:

1. **Subscription pricing** — What is the monthly and annual price point for paid access?
2. **Free vs paid boundary** — Does free registration require email verification before access to the free preview?
3. **Alert frequency cap** — If a deal is updated multiple times in one day, does a subscriber receive one alert or multiple?
4. **Document hosting** — Are all documents hosted on Sanity's asset CDN, or do some link to external sources (SEC EDGAR, court filing systems)?
5. **Archived deal access** — Do paid subscribers retain access to archived (post-2-week) deals?
6. **CTFN probability methodology** — Is the closing probability displayed as a raw number, a colour-coded band (High / Medium / Low), or both?
7. **Email sender domain** — What sending domain is used for alert emails (e.g. alerts@ctfnlighthouse.com)?

---

_End of PRD v1.0_
