import type { RichTextFeature } from "@lanjut/resume/schema-registry";
import { A, pipe } from "@mobily/ts-belt";
import type { AnyExtension, Extensions } from "@tiptap/core";
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
import Underline from "@tiptap/extension-underline";
import { UndoRedo } from "@tiptap/extensions";

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
  const has = (feature: RichTextFeature) => A.includes(features, feature);
  // Each optional extension is built only when its feature is on.
  const optional: ReadonlyArray<readonly [boolean, () => AnyExtension]> = [
    // Presentation-only decoration: renders empty-state text, adds no node or
    // mark to the schema, so it never affects parse/export structure.
    [Boolean(placeholder), () => Placeholder.configure({ placeholder })],
    [has("bold"), () => Bold],
    [has("italic"), () => Italic],
    [has("underline"), () => Underline],
    [has("bulletList"), () => BulletList],
    [has("orderedList"), () => OrderedList],
    // ListItem is the shared child node of both list types; register it once.
    [has("bulletList") || has("orderedList"), () => ListItem],
    [
      has("link"),
      () =>
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer" },
        }),
    ],
  ];

  // UndoRedo is a plugin over the transaction stream, not a node or mark, so
  // per-field history costs the schema nothing.
  return [
    Document,
    Paragraph,
    Text,
    UndoRedo,
    ...pipe(
      optional,
      A.filter(([enabled]) => enabled),
      A.map(([, build]) => build()),
    ),
  ];
}
