import type { TemplateId, TemplateSummary } from "@lanjut/resume/templates";
import { A } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { PlatformTemplateCard } from "./platform-template-card";

interface PlatformTemplateCardsProps {
  templates: ReadonlyArray<TemplateSummary>;
  preview: ResumePreview;
  query: string;
  onOpen: (template: TemplateId) => void;
}

/** Below `lg`: the templates as cards. A card opens its preview in a dialog. */
export function PlatformTemplateCards(props: PlatformTemplateCardsProps) {
  const t = useTranslations("platform.templates");

  if (A.isEmpty(props.templates)) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t("noMatch", { query: props.query })}
      </p>
    );
  }

  return (
    <ul
      id="tour-template-list"
      aria-label={t("listLabel")}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {props.templates.map((template, index) => (
        <li key={template.id}>
          <PlatformTemplateCard
            id={index === 0 ? "tour-template-try" : undefined}
            template={template}
            preview={props.preview}
            onOpen={() => props.onOpen(template.id)}
          />
        </li>
      ))}
    </ul>
  );
}
