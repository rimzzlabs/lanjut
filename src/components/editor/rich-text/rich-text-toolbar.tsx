"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered, Redo2, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import type { RichTextFeature } from "@/lib/resume/schema-registry";
import { RichTextLinkPopover } from "./rich-text-link-popover";

interface RichTextToolbarProps {
  editor: Editor;
  features: readonly RichTextFeature[];
}

export function RichTextToolbar(props: RichTextToolbarProps) {
  const t = useTranslations("editor.richText");
  const state = useEditorState({
    editor: props.editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  const has = (feature: RichTextFeature) => props.features.includes(feature);

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-input p-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={t("undo")}
        disabled={!state.canUndo}
        onClick={() => props.editor.chain().focus().undo().run()}
      >
        <Undo2 />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={t("redo")}
        disabled={!state.canRedo}
        onClick={() => props.editor.chain().focus().redo().run()}
      >
        <Redo2 />
      </Button>
      <Separator orientation="vertical" className="mx-0.5 my-1" />
      {has("bold") && (
        <Toggle
          size="xs"
          aria-label={t("bold")}
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
          aria-label={t("italic")}
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
          aria-label={t("bulletList")}
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
          aria-label={t("orderedList")}
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
