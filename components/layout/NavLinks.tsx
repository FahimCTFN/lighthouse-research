"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Active Situations" },
  { href: "/calendar", label: "Calendar" },
  { href: "/archive", label: "Archive" },
  { href: "/subscribe", label: "Pricing" },
];

export function NavLinks() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {LINKS.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
              active
                ? "bg-white/10 text-white/90"
                : "text-white/50 hover:bg-white/10 hover:text-white/80"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
