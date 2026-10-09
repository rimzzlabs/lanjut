import {
  SORTED_TEMPLATES,
  type TemplateId,
  type TemplateSummary,
} from "@lanjut/resume/templates";
import { RadioCard } from "@lanjut/ui/components/radio-card";
import { RadioGroup } from "@lanjut/ui/components/radio-group";
import { CheckIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";

interface PlatformResumeCreateTemplateListProps {
  value: TemplateId;
  onValueChange: (template: TemplateId) => void;
  preview: ResumePreview;
  label: string;
}

/**
 * The templates as a list of rows, beside the large preview. The arrow keys
 * move the choice, and the preview follows it.
 */
export function PlatformResumeCreateTemplateList(
  props: PlatformResumeCreateTemplateListProps,
) {
  return (
    <RadioGroup
      aria-label={props.label}
      value={props.value}
      onValueChange={(value) => props.onValueChange(value as TemplateId)}
      className="gap-3"
    >
      {SORTED_TEMPLATES.map((template) => (
        <TemplateRow
          key={template.id}
          template={template}
          preview={props.preview}
        />
      ))}
    </RadioGroup>
  );
}

function TemplateRow(props: {
  template: TemplateSummary;
  preview: ResumePreview;
}) {
  const t = useTranslations("platform.templates");

  return (
    <RadioCard
      value={props.template.id}
      className="flex-row items-center gap-3 p-3"
    >
      <span className="w-11 shrink-0 overflow-hidden rounded-sm bg-white ring-1 ring-black/5">
        <ResumeThumbnail resume={props.preview} template={props.template.id} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium group-data-checked/radio-card:text-primary">
          {props.template.name}
        </span>
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {t(`descriptions.${props.template.id}`)}
        </span>
      </span>
      <CheckIcon
        weight="bold"
        className="size-4 shrink-0 text-primary opacity-0 transition-opacity group-data-checked/radio-card:opacity-100"
      />
    </RadioCard>
  );
}
