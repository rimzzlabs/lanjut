"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { useResumeStore } from "@/lib/store";

export function LanguagesProficiencyToggle() {
  const showProficiency = useResumeStore(
    (state) =>
      state.open?.sections.find((s) => s.type === "languages")
        ?.showProficiency ?? true,
  );
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.languages");

  function handleChange(next: boolean) {
    updateOpen((draft) => {
      const section = draft.sections.find((s) => s.type === "languages");
      if (section) section.showProficiency = next;
    });
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span
        id="languages-proficiency-label"
        className="text-sm text-muted-foreground"
      >
        {t("proficiencyLabel")}
      </span>
      <Switch
        aria-labelledby="languages-proficiency-label"
        checked={showProficiency}
        onCheckedChange={handleChange}
      />
    </div>
  );
}
