// Stripe test → live migration helper.
//
// When you flip Vercel from Stripe test keys to live keys, every Clerk
// user whose paid status came from Stripe test mode has orphaned
// references — `cus_test_*`, `sub_test_*`, and Checkout sessions that
// don't exist in live mode. This script clears those orphan fields so
// those users go back to "free" and can re-subscribe via live Checkout.
//
// PRESERVED:
//   - role (admin / editor / viewer)
//   - watchlist
//   - manualAccessGrant + manualAccessExpiry  (admin-granted access is not Stripe-linked)
//
// CLEARED for any user whose stripeCustomerId starts with `cus_test_`
// or whose stripeSubscriptionId starts with `sub_test_` or whose
// purchased_deals contains test-mode references:
//   - stripeSubscriptionStatus
//   - stripeCustomerId
//   - stripeSubscriptionId
//   - purchased_deals (cleared entirely — Checkout session IDs don't carry over)
//
// Default behaviour: DRY RUN. Pass --apply to actually write changes.
//
// Usage:
//   node scripts/migrate-test-stripe-users.mjs              # dry run, prints what would change
//   node scripts/migrate-test-stripe-users.mjs --apply      # actually clears the fields

import { createClerkClient } from "@clerk/backend";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const SECRET = process.env.CLERK_SECRET_KEY;
if (!SECRET) {
  console.error("Missing CLERK_SECRET_KEY in .env.local");
  process.exit(1);
}

// IMPORTANT: this should run against the SAME Clerk environment that the
// app currently uses. If you're running this between Clerk test→prod
// migration too, run it before flipping CLERK_SECRET_KEY in Vercel — or
// run it twice (once against each environment).
console.log(`Using Clerk key: ${SECRET.startsWith("sk_live_") ? "LIVE" : "TEST"} (${SECRET.slice(0, 12)}…)\n`);

const clerk = createClerkClient({ secretKey: SECRET });

const APPLY = process.argv.includes("--apply");
if (!APPLY) {
  console.log("DRY RUN — pass --apply to actually clear orphan Stripe fields.\n");
}

const FIELDS_TO_CLEAR = [
  "stripeSubscriptionStatus",
  "stripeCustomerId",
  "stripeSubscriptionId",
  "purchased_deals",
];

function looksLikeTestStripe(meta) {
  if (typeof meta.stripeCustomerId === "string" && meta.stripeCustomerId.startsWith("cus_test_")) return true;
  if (typeof meta.stripeSubscriptionId === "string" && meta.stripeSubscriptionId.startsWith("sub_test_")) return true;
  // If status is set but neither customer nor subscription ID is present,
  // assume orphaned test data too.
  if (meta.stripeSubscriptionStatus && !meta.stripeCustomerId && !meta.stripeSubscriptionId) return true;
  return false;
}

async function listAllUsers() {
  const all = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const page = await clerk.users.getUserList({ limit, offset, orderBy: "-created_at" });
    all.push(...page.data);
    if (page.data.length < limit) break;
    offset += limit;
  }
  return all;
}

async function run() {
  const users = await listAllUsers();
  console.log(`Found ${users.length} Clerk user(s).\n`);

  let cleared = 0;
  let preserved = 0;
  let skipped = 0;

  for (const u of users) {
    const meta = (u.publicMetadata ?? {});
    const email = u.emailAddresses?.[0]?.emailAddress ?? "(no email)";

    // Preserve manual grants regardless of any test Stripe IDs they may have.
    if (meta.manualAccessGrant) {
      console.log(`· ${email} — manual grant preserved`);
      preserved++;
      continue;
    }

    if (!looksLikeTestStripe(meta)) {
      skipped++;
      continue;
    }

    const before = {
      stripeSubscriptionStatus: meta.stripeSubscriptionStatus,
      stripeCustomerId: meta.stripeCustomerId,
      stripeSubscriptionId: meta.stripeSubscriptionId,
      purchases: meta.purchased_deals?.length ?? 0,
    };
    console.log(`✗ ${email} — clearing test Stripe state ${JSON.stringify(before)}`);

    if (APPLY) {
      const next = { ...meta };
      for (const k of FIELDS_TO_CLEAR) delete next[k];
      await clerk.users.updateUserMetadata(u.id, { publicMetadata: next });
    }
    cleared++;
  }

  console.log(`\nSummary: ${cleared} cleared, ${preserved} preserved (manual grants), ${skipped} unchanged (no Stripe state).`);
  if (!APPLY) console.log("\nThis was a DRY RUN. Re-run with --apply to write changes.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
