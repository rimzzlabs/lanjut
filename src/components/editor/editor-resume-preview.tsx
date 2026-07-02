"use client";

import { useMemo } from "react";
import { useResumeStore } from "@/lib/store";
import { ResumeDocument } from "./resume-document";
import { resumeToPreview } from "./resume-to-preview";

/**
 * Identity of the starter résumé template ("Awal" — Indonesian for "beginning").
 * The current presentation layer is this one template; the id anchors future
 * template selection without committing to a registry yet.
 */
export const AWAL_TEMPLATE = { id: "awal", name: "Awal" } as const;

/**
 * The paper preview, driven by the open résumé in the store. The editor sidebar
 * owns loading the document (`useEditorResume`), so this only reads `open` and
 * projects it through the `resumeToPreview` adapter into the Awal template.
 */
export function EditorResumePreview() {
  const open = useResumeStore((state) => state.open);
  const openStatus = useResumeStore((state) => state.openStatus);
  const preview = useMemo(() => (open ? resumeToPreview(open) : null), [open]);

  if (openStatus === "missing") {
    return <PreviewMessage>Résumé not found.</PreviewMessage>;
  }

  if (!preview) return <PreviewSkeleton />;

  return (
    <div data-template={AWAL_TEMPLATE.id}>
      <ResumeDocument resume={preview} />
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="mx-auto aspect-[210/297] w-full max-w-[794px] animate-pulse rounded border bg-white shadow-sm" />
  );
}

function PreviewMessage(props: { children: string }) {
  return (
    <div className="mx-auto flex aspect-[210/297] w-full max-w-[794px] items-center justify-center rounded border bg-white text-sm text-muted-foreground shadow-sm">
      {props.children}
    </div>
  );
}
