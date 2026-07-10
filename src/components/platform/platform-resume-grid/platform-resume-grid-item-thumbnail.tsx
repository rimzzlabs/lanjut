"use client";

import { useMemo } from "react";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import {
  isResumePreviewEmpty,
  resumeToPreview,
} from "@/components/editor/resume-to-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumeDocument } from "@/hooks/use-resume-document";
import type { ResumeIndexEntry } from "@/lib/resume";
import { resolveTemplateId } from "@/lib/templates";
import { PlatformPaperFrame } from "../platform-paper-frame";
import { PlatformResumeGridItemEmpty } from "./platform-resume-grid-item-empty";

interface PlatformResumeGridItemThumbnailProps {
  resume: ResumeIndexEntry;
}

export function PlatformResumeGridItemThumbnail({
  resume,
}: PlatformResumeGridItemThumbnailProps) {
  const document = useResumeDocument(resume.id, resume.updatedAt);
  const preview = useMemo(
    () => (document ? resumeToPreview(document) : null),
    [document],
  );

  if (!document || !preview) {
    return (
      <PlatformPaperFrame>
        <Skeleton className="aspect-210/297 w-full rounded-none" />
      </PlatformPaperFrame>
    );
  }

  if (isResumePreviewEmpty(preview)) {
    return (
      <PlatformPaperFrame>
        <PlatformResumeGridItemEmpty />
      </PlatformPaperFrame>
    );
  }

  return (
    <PlatformPaperFrame>
      <ResumeThumbnail
        resume={preview}
        template={resolveTemplateId(document.templateId)}
      />
    </PlatformPaperFrame>
  );
}
