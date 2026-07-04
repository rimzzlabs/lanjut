"use client";

import { useMemo } from "react";
import { useResumeStore } from "@/lib/store";
import { resolveTemplateId } from "@/lib/templates";
import { ResumeDocument } from "./resume-document";
import { resumeToPreview } from "./resume-to-preview";

/**
 * The paper preview, driven by the open résumé in the store. The editor sidebar
 * owns loading the document (`useEditorResume`), so this only reads `open` and
 * projects it through the `resumeToPreview` adapter into the résumé's template.
 */
export function EditorResumePreview() {
  const open = useResumeStore((state) => state.open);
  const openStatus = useResumeStore((state) => state.openStatus);
  const preview = useMemo(() => (open ? resumeToPreview(open) : null), [open]);

  if (openStatus === "missing") {
    return <PreviewMessage>Résumé not found.</PreviewMessage>;
  }

  if (!open || !preview) return <PreviewSkeleton />;

  const template = resolveTemplateId(open.templateId);

  return (
    <div data-template={template}>
      <ResumeDocument resume={preview} template={template} />
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="mx-auto aspect-210/297 w-full max-w-[794px] animate-pulse rounded border bg-white shadow-sm" />
  );
}

function PreviewMessage(props: { children: string }) {
  return (
    <div className="mx-auto flex aspect-210/297 w-full max-w-[794px] items-center justify-center rounded border bg-white text-sm text-muted-foreground shadow-sm">
      {props.children}
    </div>
  );
}
