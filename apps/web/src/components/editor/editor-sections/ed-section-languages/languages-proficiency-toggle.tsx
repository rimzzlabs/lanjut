import { updateSectionOfType, updateSections } from "@lanjut/resume";
import { Switch } from "@lanjut/ui/components/switch";
import { A, O } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";

export function LanguagesProficiencyToggle() {
  const showProficiency = useResumeStore((state) =>
    O.mapWithDefault(
      A.find(state.open?.sections ?? [], (s) => s.type === "languages"),
      true,
      (section) => section.showProficiency ?? true,
    ),
  );
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.languages");

  function handleChange(next: boolean) {
    updateOpen((resume) =>
      updateSections(
        resume,
        updateSectionOfType("languages", (section) => ({
          ...section,
          showProficiency: next,
        })),
      ),
    );
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
