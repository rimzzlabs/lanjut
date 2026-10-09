import type { TemplateId } from "@lanjut/resume/templates";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import { FileArrowUpIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { ResumeDocument } from "@/components/editor/resume-document";
import type { ResumePreview } from "@/components/editor/resume-preview";

interface PlatformResumeCreatePreviewProps {
  draft: ResumePreview | null;
  template: TemplateId;
}

/**
 * Every page of the résumé the flow will create, laid out as the editor lays
 * it out, beside the steps from the `lg` breakpoint. It is a picture only, so
 * its links stay out of the tab order.
 */
export function PlatformResumeCreatePreview(
  props: PlatformResumeCreatePreviewProps,
) {
  const t = useTranslations("forms.create");

  return (
    <section
      aria-label={t("previewLabel")}
      className="hidden min-h-0 grid-cols-1 border-l bg-muted/40 bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[0.625rem_0.625rem] lg:grid"
    >
      <ScrollArea className="min-h-0">
        <div className="p-8">
          {props.draft && (
            <div inert data-template={props.template}>
              <ResumeDocument resume={props.draft} template={props.template} />
            </div>
          )}
          {!props.draft && <PreviewWaitingForFile />}
        </div>
      </ScrollArea>
    </section>
  );
}

function PreviewWaitingForFile() {
  const t = useTranslations("forms.create");

  return (
    <div className="mx-auto flex aspect-210/297 w-full max-w-198.5 flex-col items-center justify-center gap-3 rounded border border-dashed bg-background/60 p-8 text-center text-sm text-muted-foreground">
      <FileArrowUpIcon className="size-6" />
      {t("previewImport")}
    </div>
  );
}
