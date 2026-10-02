import { A, O } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { Switch } from "@/components/ui/switch";
import { updateSectionOfType, updateSections } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";

export function SkillsProficiencyToggle() {
  const showProficiency = useResumeStore((state) =>
    O.mapWithDefault(
      A.find(state.open?.sections ?? [], (s) => s.type === "skills"),
      true,
      (section) => section.showProficiency ?? true,
    ),
  );
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.skills");

  function handleChange(next: boolean) {
    updateOpen((resume) =>
      updateSections(
        resume,
        updateSectionOfType("skills", (section) => ({
          ...section,
          showProficiency: next,
        })),
      ),
    );
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
