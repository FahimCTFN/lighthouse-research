import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { sanityClient } from "@/lib/sanity/client";

// Public-safe projection — only fields needed for the global search.
const SEARCH_QUERY = groq`
  *[_type == "deal" && status != "archived"] {
    "slug": slug.current,
    acquirer,
    target,
    acquirer_ticker,
    target_ticker,
    status,
    sector
  }
`;

export const revalidate = 60;

export async function GET() {
  const deals = await sanityClient.fetch(SEARCH_QUERY);
  return NextResponse.json({ deals });
}
