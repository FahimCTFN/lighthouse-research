"use client";

import { useRef, useState, useLayoutEffect } from "react";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href || "#";
      const newTab: boolean = value?.newTab ?? true;
      return (
        <a
          href={href}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

// Collapsible long-form prose. Clamps to ~N lines, adds a gradient fade at the
// bottom + a Read more / Read less toggle. If the content is already shorter
// than the clamp, the button never appears.
export function CollapsibleProse({
  value,
  maxLines = 12,
}: {
  value?: PortableTextBlock[];
  maxLines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 16px body × 1.75 line-height = 28px per line.
  const maxHeightPx = maxLines * 28;

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    setOverflowing(contentRef.current.scrollHeight > maxHeightPx + 8);
  }, [value, maxHeightPx]);

  if (!value?.length) return null;

  return (
    <div>
      <div className="relative">
        <div
          ref={contentRef}
          className="prose-editorial overflow-hidden transition-[max-height] duration-300"
          style={{
            maxHeight: expanded ? "none" : `${maxHeightPx}px`,
          }}
        >
          <PortableText value={value} components={components} />
        </div>
        {overflowing && !expanded && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white"
          />
        )}
      </div>
      {overflowing && (
        <button
          onClick={() => setExpanded((x) => !x)}
          className="mt-3 inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-label text-brand-navy transition hover:border-brand-navy"
        >
          {expanded ? "Read less" : "Read more"}
          <span aria-hidden>{expanded ? "↑" : "↓"}</span>
        </button>
      )}
    </div>
  );
}
