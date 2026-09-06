"use client";

import { useMemo } from "react";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { SEED_RESUME } from "@/lib/resume";
import type { TemplateId } from "@/lib/templates";
import { cn } from "@/lib/utils";

/**
 * A live, framed render of a résumé through the real template engine, the same
 * components that draw the editor preview and feed the PDF. Nothing here is a
 * screenshot, so the landing page can never fall behind the product.
 */
export function LandingLiveResume(props: {
  template: TemplateId;
  preview?: ResumePreview;
  cropHeight?: number;
  className?: string;
}) {
  const fallback = useMemo(() => resumeToPreview(SEED_RESUME), []);
  return (
    <div
      className={cn(
        "border border-foreground/15 bg-card p-1.5 shadow-sm",
        props.className,
      )}
    >
      <div
        className="overflow-hidden bg-white"
        style={props.cropHeight ? { maxHeight: props.cropHeight } : undefined}
      >
        <ResumeThumbnail
          resume={props.preview ?? fallback}
          template={props.template}
        />
      </div>
    </div>
  );
}
