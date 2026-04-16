import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Active Sits — CTFN Lighthouse",
  description:
    "Real-time M&A deal intelligence: structured data, regulatory timelines, and CTFN editorial analysis.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://sits.ctfnlighthouse.com",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
      >
        <body className="min-h-screen font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
