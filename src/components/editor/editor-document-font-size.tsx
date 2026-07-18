"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import type { Resume } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";

const SCALE_MIN = 0.8;
const SCALE_MAX = 1.2;
const SCALE_STEP = 0.05;

type ScaleField = "nameScale" | "titleScale" | "bodyScale";

const ROWS: { field: ScaleField; labelKey: string }[] = [
  { field: "nameScale", labelKey: "fontSizeName" },
  { field: "titleScale", labelKey: "fontSizeTitle" },
  { field: "bodyScale", labelKey: "fontSizeBody" },
];

/** One labeled font-size scale slider; rests at 100% and adjusts both ways. */
function FontSizeRow(props: { field: ScaleField; labelKey: string }) {
  const value = useResumeStore((state) => state.open?.[props.field] ?? 1);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");
  const id = `font-size-${props.field}`;

  const onValueChange = (next: number | readonly number[]) => {
    const raw = Array.isArray(next) ? next[0] : (next as number);
    updateOpen((draft: Resume) => {
      draft[props.field] = Math.round(raw * 100) / 100;
    });
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span id={id} className="shrink-0 text-sm text-muted-foreground">
        {t(props.labelKey)}
      </span>
      <Slider
        aria-labelledby={id}
        className="max-w-36"
        value={value}
        onValueChange={onValueChange}
        min={SCALE_MIN}
        max={SCALE_MAX}
        step={SCALE_STEP}
      />
    </div>
  );
}

export function EditorDocumentFontSize() {
  const hasOpen = useResumeStore((state) => state.open !== null);
  if (!hasOpen) return null;
  return (
    <>
      {ROWS.map((row) => (
        <FontSizeRow
          key={row.field}
          field={row.field}
          labelKey={row.labelKey}
        />
      ))}
    </>
  );
}
