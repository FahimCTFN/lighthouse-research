import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { GlobalSearch } from "./GlobalSearch";
import { SubBadge } from "./SubBadge";
import { MobileMenu } from "./MobileMenu";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand-gold bg-brand-navy shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[5px] bg-brand-gold sm:h-[30px] sm:w-[30px]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2v6M8 8l-3 3.5M8 8l3 3.5M5 14h6"
                  stroke="#0c2d48"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="2" r="1.4" fill="#0c2d48" />
              </svg>
            </div>
            <div className="hidden leading-tight min-[400px]:block">
              <div className="text-[13px] font-medium tracking-tight text-white sm:text-sm">
                Lighthouse by CTFN
              </div>
              <div className="text-[9px] uppercase tracking-label text-white/45 sm:text-[10px]">
                M&amp;A Intelligence
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/"
              className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90 transition hover:bg-white/15"
            >
              Active Situations
            </Link>
            <Link
              href="/archive"
              className="rounded-full px-3 py-1.5 text-[11px] font-medium text-white/50 transition hover:bg-white/10 hover:text-white/80"
            >
              Archive
            </Link>
            <Link
              href="/subscribe"
              className="rounded-full px-3 py-1.5 text-[11px] font-medium text-white/50 transition hover:bg-white/10 hover:text-white/80"
            >
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>

          <SignedIn>
            <Link
              href="/account"
              className="flex items-center gap-1.5 text-xs tracking-wide text-white/60 hover:text-white"
            >
              <span className="hidden sm:inline">Account</span>
              <SubBadge />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <div className="flex items-center">
              <Link
                href="/sign-in"
                className="rounded-l-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-medium tracking-wide text-white transition hover:bg-white/20 sm:px-3.5"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-r-full border border-brand-gold bg-brand-gold px-3 py-2 text-[11px] font-medium tracking-wide text-white transition hover:brightness-110 sm:px-3.5"
              >
                Get started
              </Link>
            </div>
          </SignedOut>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
