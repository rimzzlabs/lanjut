"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { useResumeStore } from "@/lib/store";
import { resolveTemplateId, TEMPLATE_LINE_HEIGHT } from "@/lib/templates";

const LINE_HEIGHT_MIN = 1.2;
const LINE_HEIGHT_MAX = 2;
const LINE_HEIGHT_STEP = 0.05;

export function EditorDocumentLineHeight() {
  const templateId = useResumeStore((state) => state.open?.templateId);
  const lineHeight = useResumeStore((state) => state.open?.lineHeight);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");

  if (templateId === undefined) return null;

  // Until the user moves it, the slider rests at the open template's actual
  // baseline, so tightening and loosening both start from the truth.
  const value =
    lineHeight ?? TEMPLATE_LINE_HEIGHT[resolveTemplateId(templateId)];

  const onValueChange = (next: number | readonly number[]) => {
    const raw = Array.isArray(next) ? next[0] : (next as number);
    updateOpen((draft) => {
      draft.lineHeight = Math.round(raw * 100) / 100;
    });
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span
        id="line-height-label"
        className="shrink-0 text-sm text-muted-foreground"
      >
        {t("lineHeight")}
      </span>
      <Slider
        aria-labelledby="line-height-label"
        className="max-w-36"
        value={value}
        onValueChange={onValueChange}
        min={LINE_HEIGHT_MIN}
        max={LINE_HEIGHT_MAX}
        step={LINE_HEIGHT_STEP}
      />
    </div>
  );
}
