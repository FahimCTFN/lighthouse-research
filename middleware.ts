import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { UserMetadata } from "@/lib/clerk/helpers";
import { isPaidStatus } from "@/lib/clerk/helpers";

const isAccountRoute = createRouteMatcher(["/account(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isStudioRoute = createRouteMatcher(["/studio(.*)"]);
const isPaidApiRoute = createRouteMatcher([
  "/api/watchlist/(.*)",
]);

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = auth();
  const meta = (sessionClaims?.metadata ?? {}) as UserMetadata;
  const role = meta.role;
  const url = req.nextUrl;

  // /account requires login
  if (isAccountRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // /admin requires admin role
  if (isAdminRoute(req)) {
    if (!userId) return redirectToSignIn({ returnBackUrl: req.url });
    if (role !== "admin") return NextResponse.redirect(new URL("/", url));
  }

  // /studio requires editor or admin
  if (isStudioRoute(req)) {
    if (!userId) return redirectToSignIn({ returnBackUrl: req.url });
    if (role !== "admin" && role !== "editor") {
      return NextResponse.redirect(new URL("/", url));
    }
  }

  // Paid API routes — return 401 if not paid (security gate)
  if (isPaidApiRoute(req)) {
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!isPaidStatus(meta)) {
      return NextResponse.json({ error: "subscription required" }, { status: 402 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
