"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import type { RichTextFeature } from "@/lib/resume/schema-registry";
import { RichTextLinkPopover } from "./rich-text-link-popover";

interface RichTextToolbarProps {
  editor: Editor;
  features: readonly RichTextFeature[];
}

export function RichTextToolbar(props: RichTextToolbarProps) {
  const state = useEditorState({
    editor: props.editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      link: editor.isActive("link"),
    }),
  });

  const has = (feature: RichTextFeature) => props.features.includes(feature);

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-input p-0.5">
      {has("bold") && (
        <Toggle
          size="xs"
          aria-label="Bold"
          pressed={state.bold}
          onPressedChange={() =>
            props.editor.chain().focus().toggleBold().run()
          }
        >
          <Bold />
        </Toggle>
      )}
      {has("italic") && (
        <Toggle
          size="xs"
          aria-label="Italic"
          pressed={state.italic}
          onPressedChange={() =>
            props.editor.chain().focus().toggleItalic().run()
          }
        >
          <Italic />
        </Toggle>
      )}
      {has("bulletList") && (
        <Toggle
          size="xs"
          aria-label="Bullet list"
          pressed={state.bulletList}
          onPressedChange={() =>
            props.editor.chain().focus().toggleBulletList().run()
          }
        >
          <List />
        </Toggle>
      )}
      {has("orderedList") && (
        <Toggle
          size="xs"
          aria-label="Ordered list"
          pressed={state.orderedList}
          onPressedChange={() =>
            props.editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered />
        </Toggle>
      )}
      {has("link") && (
        <RichTextLinkPopover editor={props.editor} active={state.link} />
      )}
    </div>
  );
}
