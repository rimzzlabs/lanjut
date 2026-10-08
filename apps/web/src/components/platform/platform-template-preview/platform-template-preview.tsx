import type { Resume, ResumeIndexEntry } from "@lanjut/resume";
import type { TemplateSummary } from "@lanjut/resume/templates";
import { cn } from "@lanjut/ui/lib/utils";
import type { ReactNode } from "react";
import { useId } from "react";
import { useTranslations } from "use-intl";
import { EditorPreviewSkeleton } from "@/components/editor/editor-preview-skeleton";
import { ResumeDocument } from "@/components/editor/resume-document";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { PlatformTemplatePreviewActions } from "./platform-template-preview-actions";
import { PlatformTemplatePreviewSource } from "./platform-template-preview-source";

interface PlatformTemplatePreviewProps {
  template: TemplateSummary;
  preview: ResumePreview | null;
  source: string;
  onSourceChange: (source: string) => void;
  resumes: readonly ResumeIndexEntry[];
  target: ResumeIndexEntry | undefined;
  document: Resume | null;
  /** `card` stands on the page; `plain` fills a dialog that is the card. */
  variant: "card" | "plain";
  /** Sits at the end of the sticky bar, such as a dialog's close button. */
  headerEnd?: ReactNode;
}

/**
 * The chosen template at full size, every page, on the sample or on a saved
 * résumé. The bar with the name, the content switch, and the actions stays at
 * the top while the pages scroll under it. The pages are a picture only, so
 * their links stay out of the tab order.
 */
export function PlatformTemplatePreview(props: PlatformTemplatePreviewProps) {
  const t = useTranslations("platform.templates");
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex min-w-0 flex-col bg-card p-1.5",
        props.variant === "card" && "rounded-xl ring-1 ring-foreground/10",
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-3 border-b bg-card px-3 py-3 sm:px-4",
          props.headerEnd && "pr-12 sm:pr-12",
        )}
      >
        <h2
          id={headingId}
          className="mr-auto text-lg font-semibold tracking-tight"
        >
          {props.template.name}
        </h2>
        <div
          id="tour-template-try"
          className="flex min-w-0 flex-wrap items-center gap-2"
        >
          <PlatformTemplatePreviewSource
            value={props.source}
            onValueChange={props.onSourceChange}
            resumes={props.resumes}
          />
          <PlatformTemplatePreviewActions
            template={props.template}
            target={props.target}
            document={props.document}
          />
        </div>
        {props.headerEnd}
      </div>

      <p className="max-w-prose px-3 py-3 text-sm text-muted-foreground sm:px-4">
        {props.template.description}
      </p>

      <div
        aria-label={t("previewLabel", { name: props.template.name })}
        role="img"
        className="rounded-lg bg-muted/50 bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[0.625rem_0.625rem] p-4 sm:p-8"
      >
        {props.preview && (
          <div inert data-template={props.template.id}>
            <ResumeDocument
              resume={props.preview}
              template={props.template.id}
            />
          </div>
        )}
        {!props.preview && <EditorPreviewSkeleton />}
      </div>
    </section>
  );
}
