import type { Extensions } from "@tiptap/core";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import type { RichTextFeature } from "@/lib/resume/schema-registry";

/**
 * Builds the restricted TipTap schema for a richtext Field. Document/Paragraph/
 * Text are always present; every other node/mark is opt-in via `features`, so
 * disallowed structure (headings, tables, images) can neither be typed nor
 * survive a paste; the schema simply has no node to represent it.
 */
export function buildRichTextExtensions(
  features: readonly RichTextFeature[],
  placeholder?: string,
): Extensions {
  const has = (feature: RichTextFeature) => features.includes(feature);
  const extensions: Extensions = [Document, Paragraph, Text];

  // Presentation-only decoration: renders empty-state text, adds no node or mark
  // to the schema, so it never affects parse/export structure.
  if (placeholder) extensions.push(Placeholder.configure({ placeholder }));

  if (has("bold")) extensions.push(Bold);
  if (has("italic")) extensions.push(Italic);
  if (has("bulletList")) extensions.push(BulletList);
  if (has("orderedList")) extensions.push(OrderedList);
  // ListItem is the shared child node of both list types; register it once.
  if (has("bulletList") || has("orderedList")) extensions.push(ListItem);
  if (has("link")) {
    extensions.push(
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
    );
  }

  return extensions;
}
