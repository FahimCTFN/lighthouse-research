// Fix: collapse PSKY/WBD's "Vote meeting" (expected, marked overdue) and
// "Vote passed" (actual) into a single step. The earlier refresh patch added
// a new step instead of updating the existing one in place.
//
// Idempotent. Run: node scripts/patch-fix-psky-vote-step.mjs

import { createClient } from "@sanity/client";
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

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-10-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function run() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Warner Bros. Discovery"][0]`,
  );
  if (!deal) return console.warn("PSKY/WBD not found");

  const votes = deal.shareholder_votes || [];
  let changed = false;
  const VOTE_NOTE =
    "~1.743bn shares FOR vs ~16.3mn AGAINST. Advisory comp vote rejected ($886mn parachute) — does not block close.";

  const next = votes.map((v) => {
    if (v.party !== "target") return v;
    const steps = v.steps || [];
    const hasOverdueMeeting = steps.some(
      (s) => s.label === "Vote meeting" && !s.actual_date,
    );
    const hasDuplicate = steps.some((s) => s.label === "Vote passed");
    if (!hasOverdueMeeting && !hasDuplicate) return v;
    changed = true;

    // Update the existing "Vote meeting" step with the actual date + outcome note,
    // and drop the duplicate "Vote passed" step.
    const collapsed = steps
      .filter((s) => s.label !== "Vote passed")
      .map((s) =>
        s.label === "Vote meeting"
          ? {
              ...s,
              actual_date: "2026-04-23",
              expected_date: undefined,
              label: "Vote meeting — passed",
              note: VOTE_NOTE,
            }
          : s,
      );

    return { ...v, steps: collapsed };
  });

  if (!changed) return console.log("· PSKY/WBD vote step already collapsed");
  await client.patch(deal._id).set({ shareholder_votes: next }).commit();
  console.log("✓ PSKY/WBD: collapsed Vote meeting + Vote passed into single step");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
