import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { GlobalSearch } from "./GlobalSearch";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-brand-navy shadow-sm">
      <div className="border-b-2 border-brand-gold bg-brand-navy">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[5px] bg-brand-gold">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
            <div className="leading-tight">
              <div className="text-sm font-medium tracking-tight text-white">
                Lighthouse by CTFN
              </div>
              <div className="text-[10px] uppercase tracking-label text-white/45">
                M&amp;A Intelligence
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-xs">
            <GlobalSearch />
            <Link
              href="/archive"
              className="hidden tracking-wide text-white/60 hover:text-white sm:inline"
            >
              Archive
            </Link>
            <Link
              href="/subscribe"
              className="tracking-wide text-white/60 hover:text-white"
            >
              Pricing
            </Link>
            <SignedIn>
              <Link
                href="/account"
                className="tracking-wide text-white/60 hover:text-white"
              >
                Account
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="tracking-wide text-white/60 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/subscribe"
                className="rounded bg-brand-gold px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-label text-white"
              >
                Subscribe
              </Link>
            </SignedOut>
          </nav>
        </div>
      </div>

      {/* sub-nav strip */}
      <div className="border-b border-white/10 bg-brand-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2">
          <Link
            href="/"
            className="border-b-[1.5px] border-brand-gold pb-1 text-[11px] uppercase tracking-label text-brand-gold"
          >
            Active situations
          </Link>
        </div>
      </div>
    </header>
  );
}
