"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { useResumeStore } from "@/lib/store";

export function SkillsProficiencyToggle() {
  const showProficiency = useResumeStore(
    (state) =>
      state.open?.sections.find((s) => s.type === "skills")?.showProficiency ??
      true,
  );
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.skills");

  function handleChange(next: boolean) {
    updateOpen((draft) => {
      const section = draft.sections.find((s) => s.type === "skills");
      if (section) section.showProficiency = next;
    });
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span
        id="skills-proficiency-label"
        className="text-sm text-muted-foreground"
      >
        {t("proficiencyLabel")}
      </span>
      <Switch
        aria-labelledby="skills-proficiency-label"
        checked={showProficiency}
        onCheckedChange={handleChange}
      />
    </div>
  );
}
