import type { Resume } from "@lanjut/resume";
import { useFormatter, useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { EditorStylingSlider } from "./editor-styling-slider";

const SCALE_MIN = 0.8;
const SCALE_MAX = 1.2;
const SCALE_STEP = 0.05;

type ScaleField = "nameScale" | "titleScale" | "bodyScale";

const ROWS: { field: ScaleField; labelKey: string }[] = [
  { field: "nameScale", labelKey: "fontSizeName" },
  { field: "titleScale", labelKey: "fontSizeTitle" },
  { field: "bodyScale", labelKey: "fontSizeBody" },
];

/** One font-size scale; rests at 100% and adjusts both ways. */
function FontSizeRow(props: { field: ScaleField; labelKey: string }) {
  const value = useResumeStore((state) => state.open?.[props.field] ?? 1);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");
  const format = useFormatter();

  const onValueChange = (next: number) => {
    updateOpen((resume: Resume) => ({
      ...resume,
      [props.field]: Math.round(next * 100) / 100,
    }));
  };

  return (
    <EditorStylingSlider
      label={t(props.labelKey)}
      value={value}
      display={format.number(value, { style: "percent" })}
      min={SCALE_MIN}
      max={SCALE_MAX}
      step={SCALE_STEP}
      onValueChange={onValueChange}
    />
  );
}

export function EditorStylingFontSize() {
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
