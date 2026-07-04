"use client";

import { useMemo } from "react";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumeDocument } from "@/hooks/use-resume-document";
import type { ResumeIndexEntry } from "@/lib/resume";
import { resolveTemplateId } from "@/lib/templates";
import { PlatformPaperFrame } from "../platform-paper-frame";

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

  return (
    <PlatformPaperFrame>
      {document && preview ? (
        <ResumeThumbnail
          resume={preview}
          template={resolveTemplateId(document.templateId)}
        />
      ) : (
        <Skeleton className="aspect-210/297 w-full rounded-none" />
      )}
    </PlatformPaperFrame>
  );
}
