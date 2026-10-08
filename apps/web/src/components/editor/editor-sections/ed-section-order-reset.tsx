import {
  canonicalSectionIndex,
  isReorderableSection,
  type Section,
} from "@lanjut/resume";
import { Button } from "@lanjut/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lanjut/ui/components/tooltip";
import { A, pipe } from "@mobily/ts-belt";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";

/** True when the reorderable sections are already in canonical (default) order. */
function isDefaultOrder(sections: ReadonlyArray<Section>): boolean {
  const indices = pipe(
    sections,
    A.filter((section) => isReorderableSection(section.type)),
    A.map((section) => canonicalSectionIndex(section.type)),
  );
  return pipe(
    A.zip(indices, A.drop(indices, 1)),
    A.every(([previous, value]) => previous <= value),
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
            size="icon-sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => resetSectionOrder()}
          />
        }
      >
        <ArrowCounterClockwiseIcon />
        <span className="sr-only">{t("resetOrder")}</span>
      </TooltipTrigger>
      <TooltipContent>{t("resetOrder")}</TooltipContent>
    </Tooltip>
  );
}
