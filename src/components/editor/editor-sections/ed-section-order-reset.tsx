"use client";

import { ListRestart } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  canonicalSectionIndex,
  isReorderableSection,
  type Section,
} from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

/** True when the reorderable sections are already in canonical (default) order. */
function isDefaultOrder(sections: Section[]): boolean {
  const indices = sections
    .filter((section) => isReorderableSection(section.type))
    .map((section) => canonicalSectionIndex(section.type));
  return indices.every(
    (value, index) => index === 0 || indices[index - 1] <= value,
  );
}

export function EditorSectionOrderReset() {
  const open = useResumeStore((state) => state.open);
  const resetSectionOrder = useResumeStore((state) => state.resetSectionOrder);
  const t = useTranslations("editor.chrome");

  const disabled = !open || isDefaultOrder(open.sections);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon-xs"
            variant="ghost"
            className="ml-auto"
            disabled={disabled}
            onClick={() => resetSectionOrder()}
          />
        }
      >
        <ListRestart />
        <span className="sr-only">{t("resetOrder")}</span>
      </TooltipTrigger>
      <TooltipContent>{t("resetOrder")}</TooltipContent>
    </Tooltip>
  );
}
