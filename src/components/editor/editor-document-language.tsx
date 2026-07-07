"use client";

import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { RESUME_LANGUAGES, type ResumeLanguage } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";

export function EditorDocumentLanguage() {
  const language = useResumeStore((state) => state.open?.language);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");
  const tl = useTranslations("language");

  if (!language) return null;

  const items = RESUME_LANGUAGES.map((lang) => ({
    value: lang,
    label: lang.toUpperCase(),
    ariaLabel: tl(lang),
  }));

  const onChange = (value: string) => {
    updateOpen((draft) => {
      draft.language = value as ResumeLanguage;
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 px-4 pb-4">
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
