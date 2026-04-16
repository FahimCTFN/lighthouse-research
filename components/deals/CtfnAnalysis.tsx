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

export function CtfnAnalysis({
  analysis,
  risks,
}: {
  analysis?: PortableTextBlock[];
  risks?: PortableTextBlock[];
}) {
  if (!analysis?.length && !risks?.length) return null;
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="border-b border-gray-100 px-5 py-3">
        <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          CTFN Analysis
        </h2>
      </header>
      <div className="prose-editorial px-5 py-4">
        {analysis?.length ? (
          <PortableText value={analysis} components={components} />
        ) : null}
        {risks?.length ? (
          <>
            <h3>Risk Factors</h3>
            <PortableText value={risks} components={components} />
          </>
        ) : null}
      </div>
    </section>
  );
}
