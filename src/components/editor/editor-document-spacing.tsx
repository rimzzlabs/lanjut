"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { useResumeStore } from "@/lib/store";

const SPACING_MAX = 60;
const SPACING_STEP = 1;

export function EditorDocumentSpacing() {
  const hasOpen = useResumeStore((state) => state.open !== null);
  const spacing = useResumeStore((state) => state.open?.sectionSpacing ?? 0);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");

  if (!hasOpen) return null;

  const onValueChange = (value: number | readonly number[]) => {
    const next = Array.isArray(value) ? value[0] : (value as number);
    updateOpen((draft) => {
      draft.sectionSpacing = next;
    });
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span
        id="section-spacing-label"
        className="shrink-0 text-sm text-muted-foreground"
      >
        {t("sectionSpacing")}
      </span>
      <Slider
        aria-labelledby="section-spacing-label"
        className="max-w-36"
        value={spacing}
        onValueChange={onValueChange}
        min={0}
        max={SPACING_MAX}
        step={SPACING_STEP}
      />
    </div>
  );
}
