"use client";

/**
 * Sanity Studio embed.
 * Access is gated to `editor` and `admin` roles by middleware.ts.
 */
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
