import type { TemplateSummary } from "@lanjut/resume/templates";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { PlatformPaperFrame } from "../platform-paper-frame";

interface PlatformTemplateCardProps {
  id: string | undefined;
  template: TemplateSummary;
  preview: ResumePreview;
  onOpen: () => void;
}

/** A template as a card: the sheet in its tray, the name, the description. */
export function PlatformTemplateCard(props: PlatformTemplateCardProps) {
  const t = useTranslations("platform.templates");

  return (
    <button
      id={props.id}
      type="button"
      aria-label={t("previewLabel", { name: props.template.name })}
      onClick={props.onOpen}
      className="group/card flex h-full w-full cursor-pointer flex-col gap-2 rounded-xl bg-card p-1.5 pb-3 text-left ring-1 ring-foreground/10 outline-none transition-shadow hover:ring-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <PlatformPaperFrame className="w-full">
        <ResumeThumbnail resume={props.preview} template={props.template.id} />
      </PlatformPaperFrame>
      <span className="flex min-w-0 flex-col gap-0.5 px-1.5">
        <span className="truncate text-sm font-medium">
          {props.template.name}
        </span>
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {props.template.description}
        </span>
      </span>
    </button>
  );
}
