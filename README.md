# Active Sits — CTFN Lighthouse

M&A deals intelligence platform at `sits.ctfnlighthouse.com`.

Built per [`claude.md`](claude.md) and [`prd.md`](prd.md).

## Stack

Next.js 14 (App Router) · Sanity v3 · Clerk · Stripe · Mailchimp Transactional (Mandrill) · Tailwind · TypeScript strict.

## Setup

1. `cp .env.example .env.local` and fill in keys.
2. `npm install`
3. `npm run dev` → http://localhost:3000

### Required external setup

- **Clerk**: create app, copy publishable + secret key. Set `publicMetadata.role` per user (`admin` / `editor` / `viewer`) from the Clerk dashboard.
- **Sanity**: create project (any dataset, default `production`), put project ID in env. The Studio is embedded at `/studio` — the first time you load it, deploy schema with `npx sanity@latest deploy` if you want to expose the hosted studio too.
- **Stripe**: create a recurring price for the paid subscription, put its ID in `STRIPE_PAID_PRICE_ID`. Create a webhook endpoint pointing at `/api/stripe/webhook` and put the signing secret in `STRIPE_WEBHOOK_SECRET`.
- **Mailchimp Transactional (Mandrill)**: separate add-on from Mailchimp Campaigns. Put the Mandrill API key in `MANDRILL_API_KEY`.
- **Sanity webhook**: in the Sanity project, add a webhook to `POST {APP_URL}/api/alerts/send` triggered on publish of `_type == "deal"`. Send a JSON projection like `{ "slug": slug.current, "trigger_alert": trigger_alert, "alert_summary": alert_summary }`. Put the secret in `SANITY_WEBHOOK_SECRET` and the same value in the webhook header `sanity-webhook-secret`.

## Architecture highlights

- **Three-layer gating** for paid content:
  1. `middleware.ts` — edge gate on `/admin`, `/studio`, `/account`, and paid API routes
  2. Server-side check in `app/(public)/deals/[slug]/page.tsx` — chooses public vs paid GROQ query based on `isPaidStatus`
  3. `lib/sanity/queries.ts` — separate `PUBLIC_DEAL_QUERY` and `PAID_DEAL_QUERY`; paid fields never leave Sanity for free users
- **No separate database in V1** — Clerk `publicMetadata` stores subscription state and watchlist
- **ISR** — index page and deal pages revalidate every 60 seconds; Sanity webhook also calls `revalidatePath()` on publish
- **Roles** — `publicMetadata.role` = `admin` | `editor` | `viewer`. Set manually in Clerk dashboard.

## Layout

```
app/
  (public)/         ← public + free-member routes
  (protected)/      ← /account (login required)
  admin/            ← admin-only
  studio/           ← editor/admin only — Sanity Studio embed
  api/
    stripe/{webhook,create-checkout-session,portal}/
    watchlist/{follow,unfollow}/
    alerts/send/
    admin/{users,grant,revoke}/
components/{deals,filters,layout,ui}/
lib/{sanity,clerk,stripe,mailchimp}/
schemas/deal.ts
sanity.config.ts
middleware.ts
```

## Deploy

Vercel. Add all env vars in the project settings. Custom domain CNAME `sits.ctfnlighthouse.com` → `cname.vercel-dns.com`.
