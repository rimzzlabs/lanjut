import { A, pipe } from "@mobily/ts-belt";
import { ListRestart } from "lucide-react";
import { useTranslations } from "use-intl";
import {
  canonicalSectionIndex,
  isReorderableSection,
  type Section,
} from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

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
        <ListRestart />
        <span className="sr-only">{t("resetOrder")}</span>
      </TooltipTrigger>
      <TooltipContent>{t("resetOrder")}</TooltipContent>
    </Tooltip>
  );
}
