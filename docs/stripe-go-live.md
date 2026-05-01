# Stripe: test sandbox → live production runbook

Your situation: there's already an activated, live Stripe account connected to `ctfnlighthouse.com`. The Active Sits app (subdomain `sits.ctfnlighthouse.com`) is currently running against Stripe **test sandbox**. This runbook flips the Active Sits app to use the existing live account, with its own product / webhook / pricing.

Total time: ~30 min of dashboard work + 5 min testing. No business-verification delay since the account is already activated.

---

## 1. Pre-flight (before touching anything)

- Confirm with Graham that the existing live Stripe account should host Active Sits products too (vs. setting up a separate Stripe account for it). The default assumption: **same account, separate Product/Price**, since you want a unified payout + reporting view for ctfnlighthouse and Active Sits.
- Confirm `sits.ctfnlighthouse.com` is already deployed and serving traffic on Vercel. The webhook URL needs to be reachable before Stripe will verify it.
- Make sure you have admin access to:
  - Stripe live dashboard
  - Vercel project settings (to update env vars)
  - Clerk dashboard (in case manual grants need to be re-applied after migration)

---

## 2. Create the Active Sits product in Stripe live mode

1. Stripe dashboard → make sure you're in **Live mode** (toggle at top right says "Live" not "Test").
2. **Products → + Add product**:
   - Name: `Active Situations Professional` (or whatever the test-mode name was)
   - Description: short blurb about the M&A intelligence subscription
   - Pricing: Recurring · Monthly · whatever the test-mode price was (likely $499/mo)
   - **Tax behavior**: same as your test product (typically "Exclusive" — gets handled at checkout if you've set up Stripe Tax)
3. Save → **copy the new `price_...` ID**. This is your new `STRIPE_PAID_PRICE_ID`.

If you also have single-deal report purchases (the `allow_single_purchase` / `single_purchase_price` Sanity field), those are created on-the-fly in `app/api/stripe/buy-report/route.ts` using `price_data` instead of pre-created prices, so no additional Products needed.

---

## 3. Get the live API keys

Live mode → **Developers → API keys**:
- Publishable key: `pk_live_...`
- Reveal secret key: `sk_live_...`

Copy both — you'll paste them into Vercel in step 5.

---

## 4. Create the live webhook endpoint

Live mode → **Developers → Webhooks → + Add endpoint**:
- **Endpoint URL**: `https://sits.ctfnlighthouse.com/api/stripe/webhook`
- **Events to send** (subscribe to exactly these — they match what `app/api/stripe/webhook/route.ts` handles):
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- API version: latest (or pin to whatever the current `lib/stripe/client.ts` uses — check `apiVersion` in the Stripe client constructor)
- Save → **copy the signing secret `whsec_...`**

If your existing live account already has a webhook for ctfnlighthouse.com, **do not modify it** — create a new endpoint specifically for Active Sits. Each endpoint has its own signing secret.

---

## 5. Update Vercel env vars (Production environment ONLY)

Vercel → Active Sits project → Settings → Environment Variables → filter by **Production**.

Update these four:

| Variable | New value | Old (test) value |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (from step 3) | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (from step 3) | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from step 4) | old test webhook secret |
| `STRIPE_PAID_PRICE_ID` | `price_...` (from step 2) | old test price ID |

**Leave Preview and Development environments on test keys.** That way:
- PR preview deployments keep using Stripe test mode → safe to test new code without burning real money
- Local dev keeps using whatever's in your `.env.local` (also test keys) → safe to develop

After updating, **redeploy** (Vercel → Deployments → … → Redeploy on the latest production deployment). Env var changes don't apply to running deployments without a redeploy.

---

## 6. Migrate orphan test users in Clerk metadata

Anyone who tested the paid flow against the test sandbox has stale metadata pointing to test-mode customer/subscription IDs. After the env var flip, those users will appear "subscribed" in Active Sits but Stripe live has no record of them — they need to re-subscribe via live Checkout.

Run the migration script:

```bash
# 1. Dry run first — see what would change, change nothing
node scripts/migrate-test-stripe-users.mjs

# 2. If the dry run looks right, apply it
node scripts/migrate-test-stripe-users.mjs --apply
```

What it does:
- Lists every Clerk user
- **Preserves** any user with `manualAccessGrant: true` (admin-granted access — not Stripe-linked)
- **Clears** `stripeSubscriptionStatus`, `stripeCustomerId`, `stripeSubscriptionId`, and `purchased_deals` for any user whose Stripe IDs look like test-mode (`cus_test_*` / `sub_test_*`) or whose status is set without an ID
- Leaves `role`, `watchlist`, manual-grant fields, and email alone

Review the dry-run output before applying. If a user you wanted to preserve gets flagged, set `manualAccessGrant: true` for them in Clerk dashboard first, then re-run.

---

## 7. Smoke test with a real card

On `sits.ctfnlighthouse.com`:

1. Sign in as a non-paid user (or use the test account you cleared in step 6).
2. Visit any deal — confirm `<PaywallGate />` shows.
3. Click Subscribe → complete Checkout with a **real** card (yours).
4. On return, confirm:
   - URL hits a `?session_id=...` callback
   - `<CheckoutSuccess />` confetti / message renders
   - Deal page now shows full content (no paywall)
   - Account page shows "Active" subscription with the real `cus_...` / `sub_...` IDs
5. Stripe live dashboard → Customers → confirm your customer record is there with the subscription
6. Stripe live → Webhooks → click into your endpoint → confirm a `checkout.session.completed` event fired and got `200 OK`
7. **Refund the test charge**: Stripe → Payments → find your charge → … → Refund. Then cancel the subscription in your account page (Customer Portal) and confirm:
   - Webhook `customer.subscription.deleted` fires
   - Clerk metadata flips to `cancelled`
   - Deal page re-locks

If any step fails: check the webhook event log in Stripe (Developers → Events) — the response body usually tells you what went wrong (signature mismatch = wrong `STRIPE_WEBHOOK_SECRET`; metadata not updating = Clerk secret key issue; etc.).

---

## 8. Rollback (if something's wrong)

If the live cutover is broken for any reason, you can roll back in <2 minutes:

1. Vercel → Production env vars → revert the four Stripe values back to the test versions
2. Redeploy
3. Old test customers' metadata is gone (you cleared it in step 6) but they can re-subscribe via test mode

Keep the live Stripe Product / webhook in place — they're not hurting anything, and you'll want them again on the next attempt.

---

## 9. Post-cutover cleanup

Once the live cutover is verified:

- Delete the test-mode Stripe webhook endpoint (it's still pointing at the production URL but signing with a test secret, which would fail signature verification — harmless but noisy in your dashboard).
- Archive the test-mode Stripe Product (keeps your dashboard clean; doesn't delete history).
- Update [HANDOVER.md](../HANDOVER.md) section 5 to note Stripe is now live, and remove the "test sandbox" caveat.
- Keep `.env.local` on test keys for local dev. Update Vercel **Preview** to keep test keys too.
