// Shared rich-text block config used by every Portable Text field on Deal.
// Supports headings, lists, bold/italic, blockquotes, links, and inline images.
export const richTextBlock = {
  type: "block",
  styles: [
    { title: "Paragraph", value: "normal" },
    { title: "Subhead (H3)", value: "h3" },
    { title: "Section (H4)", value: "h4" },
    { title: "Blockquote", value: "blockquote" },
  ],
  lists: [
    { title: "Bullet", value: "bullet" },
    { title: "Numbered", value: "number" },
  ],
  marks: {
    decorators: [
      { title: "Bold", value: "strong" },
      { title: "Italic", value: "em" },
      { title: "Underline", value: "underline" },
      { title: "Code", value: "code" },
    ],
    annotations: [
      {
        name: "link",
        type: "object",
        title: "Link",
        fields: [
          {
            name: "href",
            type: "url",
            title: "URL",
            validation: (R: { uri: (o: { scheme: string[] }) => unknown }) =>
              R.uri({ scheme: ["http", "https", "mailto", "tel"] }),
          },
          {
            name: "newTab",
            type: "boolean",
            title: "Open in new tab",
            initialValue: true,
          },
        ],
      },
    ],
  },
} as const;

// Image block for embedding charts, diagrams, or screenshots in rich text.
export const richTextImage = {
  type: "image",
  options: { hotspot: true },
  fields: [
    {
      name: "alt",
      type: "string",
      title: "Alt text",
      description: "Describe the image for accessibility.",
    },
    {
      name: "caption",
      type: "string",
      title: "Caption (optional)",
    },
  ],
} as const;

// Combined rich text config: blocks + images.
export const richTextWithImages = [richTextBlock, richTextImage];
