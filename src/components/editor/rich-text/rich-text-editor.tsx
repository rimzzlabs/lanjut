"use client";

import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { useRef } from "react";
import { emptyRichTextValue } from "@/lib/resume";
import type { RichTextFeature } from "@/lib/resume/schema-registry";
import { RichTextBubbleMenu } from "./rich-text-bubble-menu";
import { buildRichTextExtensions } from "./rich-text-extensions";
import { RichTextToolbar } from "./rich-text-toolbar";

interface RichTextEditorProps {
  value: JSONContent | undefined;
  features: readonly RichTextFeature[];
  onChange: (value: JSONContent) => void;
  onBlur?: () => void;
  placeholder?: string;
  id?: string;
}

/**
 * Restricted rich-text control. Uncontrolled after mount: `value` seeds the
 * initial document once, then edits flow out through `onChange`. The editor's
 * live document is never re-synced from `value` (that would reset the caret);
 * to load a different document, remount with a fresh `key`.
 */
export function RichTextEditor(props: RichTextEditorProps) {
  // The editor is created once; keep the change handlers current through refs so
  // a re-render with new callbacks (e.g. an experience entry shifting index) is
  // always reflected, without recreating the editor.
  const onChangeRef = useRef(props.onChange);
  onChangeRef.current = props.onChange;
  const onBlurRef = useRef(props.onBlur);
  onBlurRef.current = props.onBlur;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildRichTextExtensions(props.features, props.placeholder),
    content: props.value ?? emptyRichTextValue(),
    editorProps: {
      attributes: {
        ...(props.id ? { id: props.id } : {}),
        class:
          "tiptap-content max-h-56 min-h-24 overflow-y-auto rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
      },
    },
    onUpdate: ({ editor }) => onChangeRef.current(editor.getJSON()),
    onBlur: () => onBlurRef.current?.(),
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <RichTextToolbar editor={editor} features={props.features} />
      <RichTextBubbleMenu editor={editor} features={props.features} />
      <EditorContent editor={editor} />
    </div>
  );
}
