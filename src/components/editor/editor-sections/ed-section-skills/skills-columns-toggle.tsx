"use client";

import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import type { SectionColumns } from "@/lib/resume/types";
import { useResumeStore } from "@/lib/store";

export function SkillsColumnsToggle() {
  const columns = useResumeStore(
    (state) =>
      state.open?.sections.find((s) => s.type === "skills")?.columns ?? 2,
  );
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.skills");

  function handleChange(value: string) {
    const next: SectionColumns = value === "1" ? 1 : 2;
    updateOpen((draft) => {
      const section = draft.sections.find((s) => s.type === "skills");
      if (section) section.columns = next;
    });
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{t("columnsLabel")}</span>
      <SegmentedControl
        aria-label={t("columnsLabel")}
        value={String(columns)}
        onValueChange={handleChange}
        items={[
          {
            value: "1",
            label: t("columnsOne"),
            ariaLabel: t("columnsOneAria"),
          },
          {
            value: "2",
            label: t("columnsTwo"),
            ariaLabel: t("columnsTwoAria"),
          },
        ]}
      />
    </div>
  );
}
