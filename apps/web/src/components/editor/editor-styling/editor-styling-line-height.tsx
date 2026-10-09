import {
  resolveTemplateId,
  TEMPLATE_LINE_HEIGHT,
} from "@lanjut/resume/templates";
import { useFormatter, useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { EditorStylingSlider } from "./editor-styling-slider";

const LINE_HEIGHT_MIN = 1.2;
const LINE_HEIGHT_MAX = 2;
const LINE_HEIGHT_STEP = 0.05;

export function EditorStylingLineHeight() {
  const templateId = useResumeStore((state) => state.open?.templateId);
  const lineHeight = useResumeStore((state) => state.open?.lineHeight);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.styling");
  const format = useFormatter();

  if (templateId === undefined) return null;

  // Until the user moves it, the slider rests at the open template's actual
  // baseline, so tightening and loosening both start from the truth.
  const value =
    lineHeight ?? TEMPLATE_LINE_HEIGHT[resolveTemplateId(templateId)];

  return (
    <EditorStylingSlider
      label={t("betweenLines")}
      value={value}
      display={format.number(value, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      min={LINE_HEIGHT_MIN}
      max={LINE_HEIGHT_MAX}
      step={LINE_HEIGHT_STEP}
      onValueChange={(next) => {
        updateOpen((resume) => ({
          ...resume,
          lineHeight: Math.round(next * 100) / 100,
        }));
      }}
    />
  );
}
