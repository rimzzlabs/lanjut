import { A, O } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { useResumeStore } from "@/lib/store";
import { applyDensity, DENSITIES, type Density, densityOf } from "./density";

// No item has this value, so no segment shows as chosen after a slider moves
// off every preset.
const CUSTOM = "custom";

/** Density presets: one choice that sets the space between sections and lines. */
export function EditorStylingDensity() {
  const density = useResumeStore((state) => {
    if (state.open === null) return undefined;
    return O.mapWithDefault(densityOf(state.open), CUSTOM, String);
  });
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.styling");

  if (density === undefined) return null;

  const items = A.map(DENSITIES, (value) => ({ value, label: t(value) }));

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{t("density")}</span>
      <SegmentedControl
        aria-label={t("density")}
        value={density}
        onValueChange={(value) => {
          updateOpen((resume) => applyDensity(resume, value as Density));
        }}
        items={items}
      />
    </div>
  );
}
