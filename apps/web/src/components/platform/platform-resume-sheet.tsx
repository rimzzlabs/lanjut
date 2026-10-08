import type { Resume } from "@lanjut/resume";
import { resolveTemplateId } from "@lanjut/resume/templates";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { useMemo } from "react";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import {
  isResumePreviewEmpty,
  resumeToPreview,
} from "@/components/editor/resume-to-preview";
import { PlatformResumeGridItemEmpty } from "./platform-resume-grid/platform-resume-grid-item-empty";

/**
 * The first page of a saved résumé: a skeleton while the document loads, the
 * blank-page placeholder when it has no content yet, or the real render.
 */
export function PlatformResumeSheet(props: { document: Resume | null }) {
  const preview = useMemo(
    () => (props.document ? resumeToPreview(props.document) : null),
    [props.document],
  );

  if (!props.document || !preview) {
    return <Skeleton className="aspect-210/297 w-full rounded-none" />;
  }

  if (isResumePreviewEmpty(preview)) return <PlatformResumeGridItemEmpty />;

  return (
    <ResumeThumbnail
      resume={preview}
      template={resolveTemplateId(props.document.templateId)}
    />
  );
}
