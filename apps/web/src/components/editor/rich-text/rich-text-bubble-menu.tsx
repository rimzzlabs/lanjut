import type { RichTextFeature } from "@lanjut/resume/schema-registry";
import { Toggle } from "@lanjut/ui/components/toggle";
import { A } from "@mobily/ts-belt";
import { TextBIcon, TextItalicIcon } from "@phosphor-icons/react";
import { type Editor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useTranslations } from "use-intl";
import { RichTextLinkPopover } from "./rich-text-link-popover";

interface RichTextBubbleMenuProps {
  editor: Editor;
  features: readonly RichTextFeature[];
}

export function RichTextBubbleMenu(props: RichTextBubbleMenuProps) {
  const t = useTranslations("editor.richText");
  const state = useEditorState({
    editor: props.editor,
    selector: (context) => {
      const { editor } = context;
      return {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        link: editor.isActive("link"),
      };
    },
  });

  const has = (feature: RichTextFeature) => A.includes(props.features, feature);

  return (
    <BubbleMenu
      editor={props.editor}
      // Key off the selection, not editor focus: opening the link popover moves
      // focus to a portaled input outside the menu, which the default
      // focus-based `shouldShow` would treat as a blur and hide the menu.
      shouldShow={(context) => {
        const { editor, state } = context;
        return editor.isEditable && !state.selection.empty;
      }}
      className="flex items-center gap-0.5 rounded-md border border-input bg-popover p-0.5 shadow-md"
    >
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
      {has("link") && (
        <RichTextLinkPopover editor={props.editor} active={state.link} />
      )}
    </BubbleMenu>
  );
}
