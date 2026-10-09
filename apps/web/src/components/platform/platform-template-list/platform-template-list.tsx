import type { TemplateId, TemplateSummary } from "@lanjut/resume/templates";
import { RadioGroup } from "@lanjut/ui/components/radio-group";
import { A } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { PlatformTemplateListItem } from "./platform-template-list-item";

interface PlatformTemplateListProps {
  templates: ReadonlyArray<TemplateSummary>;
  value: TemplateId;
  onValueChange: (template: TemplateId) => void;
  preview: ResumePreview;
  query: string;
}

/** The templates as one choice, in a column beside the preview from `lg`. */
export function PlatformTemplateList(props: PlatformTemplateListProps) {
  const t = useTranslations("platform.templates");

  if (A.isEmpty(props.templates)) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t("noMatch", { query: props.query })}
      </p>
    );
  }

  return (
    <RadioGroup
      id="tour-template-list"
      aria-label={t("listLabel")}
      value={props.value}
      onValueChange={(value) => props.onValueChange(value as TemplateId)}
      className="gap-3"
    >
      {props.templates.map((template) => (
        <PlatformTemplateListItem
          key={template.id}
          template={template}
          preview={props.preview}
        />
      ))}
    </RadioGroup>
  );
}
