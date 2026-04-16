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

export function ProseSection({
  heading,
  value,
}: {
  heading?: string;
  value?: PortableTextBlock[];
}) {
  if (!value?.length) return null;
  return (
    <section className="prose-editorial">
      {heading && <h3>{heading}</h3>}
      <PortableText value={value} components={components} />
    </section>
  );
}
