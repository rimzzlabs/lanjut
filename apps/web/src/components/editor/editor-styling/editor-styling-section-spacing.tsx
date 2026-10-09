import { useFormatter, useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { EditorStylingSlider } from "./editor-styling-slider";

// -24 cancels the 24px baseline gap above headings exactly (sections flush).
const SPACING_MIN = -24;
const SPACING_MAX = 60;
const SPACING_STEP = 1;

export function EditorStylingSectionSpacing() {
  const hasOpen = useResumeStore((state) => state.open !== null);
  const spacing = useResumeStore((state) => state.open?.sectionSpacing ?? 0);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.styling");
  const format = useFormatter();

  if (!hasOpen) return null;

  const pixels = `${format.number(spacing, { signDisplay: "exceptZero" })} px`;

  return (
    <EditorStylingSlider
      label={t("betweenSections")}
      value={spacing}
      display={spacing === 0 ? t("default") : pixels}
      min={SPACING_MIN}
      max={SPACING_MAX}
      step={SPACING_STEP}
      onValueChange={(next) => {
        updateOpen((resume) => ({ ...resume, sectionSpacing: next }));
      }}
    />
  );
}
