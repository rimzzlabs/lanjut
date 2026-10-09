import type { TemplateSummary } from "@lanjut/resume/templates";
import { RadioCard } from "@lanjut/ui/components/radio-card";
import { CheckIcon } from "@phosphor-icons/react";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";

interface PlatformTemplateListItemProps {
  template: TemplateSummary;
  preview: ResumePreview;
}

/**
 * One template row. The sheet sits 13px inside the card (12px padding and the
 * 1px border), so `rounded-sm` (9.6px) keeps it concentric with the card's
 * `rounded-xl` (22.4px).
 */
export function PlatformTemplateListItem(props: PlatformTemplateListItemProps) {
  const { template } = props;

  return (
    <RadioCard
      value={template.id}
      className="relative flex-row items-center gap-3 bg-card p-3"
    >
      <div className="w-12 shrink-0 overflow-hidden rounded-sm bg-white ring-1 ring-black/5">
        <ResumeThumbnail resume={props.preview} template={template.id} />
      </div>

      <span className="flex min-w-0 flex-col gap-0.5 pr-6">
        <span className="truncate text-sm font-medium">{template.name}</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {template.description}
        </span>
      </span>

      <CheckIcon
        weight="bold"
        className="absolute top-3 right-3 size-4 text-primary opacity-0 transition-opacity group-data-checked/radio-card:opacity-100"
      />
    </RadioCard>
  );
}
