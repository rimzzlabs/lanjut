import type { RichTextFeature } from "@lanjut/resume/schema-registry";
import { Button } from "@lanjut/ui/components/button";
import { Separator } from "@lanjut/ui/components/separator";
import { Toggle } from "@lanjut/ui/components/toggle";
import { A } from "@mobily/ts-belt";
import {
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react";
import { type Editor, useEditorState } from "@tiptap/react";
import { useTranslations } from "use-intl";
import { RichTextLinkPopover } from "./rich-text-link-popover";

interface RichTextToolbarProps {
  editor: Editor;
  features: readonly RichTextFeature[];
}

export function RichTextToolbar(props: RichTextToolbarProps) {
  const t = useTranslations("editor.richText");
  const state = useEditorState({
    editor: props.editor,
    selector: (context) => {
      const { editor } = context;
      return {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        link: editor.isActive("link"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      };
    },
  });

  const has = (feature: RichTextFeature) => A.includes(props.features, feature);

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
        <ArrowUUpLeftIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={t("redo")}
        disabled={!state.canRedo}
        onClick={() => props.editor.chain().focus().redo().run()}
      >
        <ArrowUUpRightIcon />
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
          <TextBIcon />
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
          <TextItalicIcon />
        </Toggle>
      )}
      {has("underline") && (
        <Toggle
          size="xs"
          aria-label={t("underline")}
          pressed={state.underline}
          onPressedChange={() =>
            props.editor.chain().focus().toggleUnderline().run()
          }
        >
          <TextUnderlineIcon />
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
          <ListBulletsIcon />
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
          <ListNumbersIcon />
        </Toggle>
      )}
      {has("link") && (
        <RichTextLinkPopover editor={props.editor} active={state.link} />
      )}
    </div>
  );
}
