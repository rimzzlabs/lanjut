import { useFormatter, useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { EditorStylingSlider } from "./editor-styling-slider";

// Hard bounds: outside -0.5..0.5 at the 8-9pt PDF body sizes, text extraction
// stops recovering word boundaries (words split when too wide, merge when too
// tight), which would defeat ATS parsing.
const TRACKING_MIN = -0.5;
const TRACKING_MAX = 0.5;
const TRACKING_STEP = 0.05;

export function EditorStylingLetterSpacing() {
  const hasOpen = useResumeStore((state) => state.open !== null);
  const tracking = useResumeStore((state) => state.open?.letterSpacing ?? 0);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.styling");
  const format = useFormatter();

  if (!hasOpen) return null;

  const pixels = `${format.number(tracking, {
    signDisplay: "exceptZero",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} px`;

  return (
    <EditorStylingSlider
      label={t("betweenLetters")}
      value={tracking}
      display={tracking === 0 ? t("default") : pixels}
      min={TRACKING_MIN}
      max={TRACKING_MAX}
      step={TRACKING_STEP}
      onValueChange={(next) => {
        updateOpen((resume) => ({
          ...resume,
          letterSpacing: Math.round(next * 100) / 100,
        }));
      }}
    />
  );
}
