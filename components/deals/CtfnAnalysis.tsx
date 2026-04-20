import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import Image from "next/image";
import { projectId, dataset } from "@/lib/sanity/client";
import type { PaidDeal } from "@/lib/sanity/types";

interface SanityImageValue {
  _type: "image";
  asset?: { _ref?: string };
  alt?: string;
  caption?: string;
}

function sanityImageUrl(ref: string): string {
  const [, id, dims, ext] = ref.split("-");
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dims}.${ext}`;
}

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
  types: {
    image: ({ value }: { value: SanityImageValue }) => {
      const ref = value?.asset?._ref;
      if (!ref) return null;
      return (
        <figure className="my-5">
          <Image
            src={sanityImageUrl(ref)}
            alt={value.alt || ""}
            width={680}
            height={400}
            className="w-full rounded border border-gray-200"
            style={{ height: "auto" }}
          />
          {value.caption && (
            <figcaption className="mt-1.5 text-center text-[11px] italic text-gray-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

interface Section {
  key: string;
  title: string;
  value?: PortableTextBlock[];
}

function hasContent(blocks?: PortableTextBlock[]): boolean {
  if (!blocks?.length) return false;
  return blocks.some((b) => {
    if (b._type !== "block") return true;
    const children = (b as { children?: { text?: string }[] }).children ?? [];
    return children.some((c) => (c.text ?? "").trim().length > 0);
  });
}

export function CtfnAnalysis({ deal }: { deal: PaidDeal }) {
  const sections: Section[] = [
    {
      key: "target",
      title:
        deal.target ? `${deal.target}` : "Target Company",
      value: deal.ctfn_target_company,
    },
    {
      key: "acquirer",
      title:
        deal.acquirer ? `${deal.acquirer}` : "Acquirer Company",
      value: deal.ctfn_acquirer_company,
    },
    {
      key: "overlaps",
      title: "Overlaps",
      value: deal.ctfn_overlaps,
    },
    {
      key: "synergies",
      title: "Rationale & Synergies",
      value: deal.ctfn_rationale_synergies,
    },
    {
      key: "competition",
      title: "Competition",
      value: deal.ctfn_competition,
    },
    {
      key: "customers",
      title: "Customers",
      value: deal.ctfn_customers,
    },
    {
      key: "precedent",
      title: "Precedent Transactions",
      value: deal.ctfn_precedent_transactions,
    },
    {
      key: "risks",
      title: "Risk Factors",
      value: deal.risk_factors,
    },
  ];

  const visible = sections.filter((s) => hasContent(s.value));
  if (!visible.length) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="border-b border-gray-100 px-5 py-3">
        <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          CTFN Analysis
        </h2>
      </header>

      {/* Sub-section nav — quick-scan for readers */}
      {visible.length > 2 && (
        <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-5 py-2.5">
          {visible.map((s) => (
            <a
              key={s.key}
              href={`#ctfn-${s.key}`}
              className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-medium text-gray-600 transition hover:border-brand-navy hover:text-brand-navy"
            >
              {s.title}
            </a>
          ))}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {visible.map((s) => (
          <div key={s.key} id={`ctfn-${s.key}`} className="px-5 py-4">
            <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-label text-brand-navy">
              {s.title}
            </h3>
            <div className="prose-editorial">
              <PortableText value={s.value!} components={components} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
