import { type ComponentProps, lazy, Suspense } from "react";
import type { RichTextEditor } from "./rich-text-editor";

// TipTap loads on intent or on first render, never on the editor's first paint.
export function preloadRichTextEditor() {
  return import("./rich-text-editor");
}

function loadRichTextEditor() {
  return preloadRichTextEditor().then((module) => ({
    default: module.RichTextEditor,
  }));
}

const LazyRichTextEditor = lazy(loadRichTextEditor);

export function RichTextField(props: ComponentProps<typeof RichTextEditor>) {
  return (
    <Suspense fallback={<RichTextFieldFallback />}>
      <LazyRichTextEditor {...props} />
    </Suspense>
  );
}

function RichTextFieldFallback() {
  return (
    <div aria-hidden className="flex flex-col gap-1.5">
      <div className="h-7.5 rounded-md border border-input" />
      <div className="min-h-24 rounded-md border border-input" />
    </div>
  );
}
