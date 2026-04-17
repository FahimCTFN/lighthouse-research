import { timingSafeEqual } from "crypto";

// Validate that a return URL is on our own origin (prevents open redirect)
export function validateReturnUrl(
  url: string | undefined,
  fallback: string,
): string {
  if (!url) return fallback;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return fallback;
  try {
    const parsed = new URL(url, appUrl);
    if (parsed.origin !== new URL(appUrl).origin) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

// Constant-time string comparison (prevents timing attacks on secrets)
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

// Validate a deal slug format
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,198}[a-z0-9]$/.test(slug);
}

// Max watchlist size
export const MAX_WATCHLIST_SIZE = 50;
