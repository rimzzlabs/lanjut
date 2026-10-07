import { D } from "@mobily/ts-belt";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResumeStore } from "@/lib/store";

/**
 * Restores every document styling setting to its default: contact icons shown,
 * template font, template line height, no tracking, baseline section spacing.
 * Document language is content (headings, dates), not styling, so it is
 * deliberately left untouched.
 */
export function EditorDocumentStyleReset() {
  const pristine = useResumeStore((state) => {
    const open = state.open;
    if (!open) return true;
    return (
      (open.showIcons ?? true) &&
      !open.font &&
      (open.sectionSpacing ?? 0) === 0 &&
      (open.letterSpacing ?? 0) === 0 &&
      open.lineHeight == null &&
      (open.nameScale ?? 1) === 1 &&
      (open.titleScale ?? 1) === 1 &&
      (open.bodyScale ?? 1) === 1
    );
  });
  const hasOpen = useResumeStore((state) => state.open !== null);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.document");

  if (!hasOpen) return null;

  const onReset = () => {
    updateOpen((resume) => ({
      ...D.deleteKeys(resume, [
        "font",
        "lineHeight",
        "nameScale",
        "titleScale",
        "bodyScale",
      ]),
      showIcons: true,
      sectionSpacing: 0,
      letterSpacing: 0,
    }));
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pristine}
            onClick={onReset}
          />
        }
      >
        <span className="sr-only">{t("resetStyling")}</span>
        <ArrowsClockwiseIcon />
      </TooltipTrigger>
      <TooltipContent>
        <span>{t("resetStylingHint")}</span>
      </TooltipContent>
    </Tooltip>
  );
}
