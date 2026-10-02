import { A, S } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { RESUME_LANGUAGES, type ResumeLanguage } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";

export function EditorDocumentLanguage() {
  const language = useResumeStore((state) => state.open?.language);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");
  const tl = useTranslations("language");

  if (!language) return null;

  const items = A.map(RESUME_LANGUAGES, (lang) => ({
    value: lang,
    label: S.toUpperCase(lang),
    ariaLabel: tl(lang),
  }));

  const onChange = (value: string) => {
    updateOpen((resume) => ({ ...resume, language: value as ResumeLanguage }));
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">
        {t("documentLanguage")}
      </span>
      <SegmentedControl
        aria-label={t("documentLanguage")}
        value={language}
        onValueChange={onChange}
        items={items}
      />
    </div>
  );
}
