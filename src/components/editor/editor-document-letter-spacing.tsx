"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { useResumeStore } from "@/lib/store";

// Hard bounds: outside -0.5..0.5 at the 8-9pt PDF body sizes, text extraction
// stops recovering word boundaries (words split when too wide, merge when too
// tight), which would defeat ATS parsing.
const TRACKING_MIN = -0.5;
const TRACKING_MAX = 0.5;
const TRACKING_STEP = 0.05;

export function EditorDocumentLetterSpacing() {
  const hasOpen = useResumeStore((state) => state.open !== null);
  const tracking = useResumeStore((state) => state.open?.letterSpacing ?? 0);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");

  if (!hasOpen) return null;

  const onValueChange = (value: number | readonly number[]) => {
    const next = Array.isArray(value) ? value[0] : (value as number);
    updateOpen((draft) => {
      draft.letterSpacing = Math.round(next * 100) / 100;
    });
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span
        id="letter-spacing-label"
        className="shrink-0 text-sm text-muted-foreground"
      >
        {t("letterSpacing")}
      </span>
      <Slider
        aria-labelledby="letter-spacing-label"
        className="max-w-36"
        value={tracking}
        onValueChange={onValueChange}
        min={TRACKING_MIN}
        max={TRACKING_MAX}
        step={TRACKING_STEP}
      />
    </div>
  );
}
