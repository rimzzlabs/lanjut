import type { ReadinessTarget } from "@lanjut/resume/readiness";
import { Button } from "@lanjut/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@lanjut/ui/components/popover";
import { Progress } from "@lanjut/ui/components/progress";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { useEditorChromeStore } from "@/lib/store";
import { findCheckField, openCheckTarget } from "./check-target";
import { EditorReadinessLabel } from "./editor-readiness-label";
import { EditorReadinessList } from "./editor-readiness-list";
import { EditorReadinessSkeleton } from "./editor-readiness-skeleton";
import { useReadiness } from "./use-readiness";

/**
 * How ready the open résumé is to send, in the bar above the page preview.
 * The label opens the checklist, and an item opens the section it points at.
 * When the popover closes after a jump, it hands focus to that field instead
 * of its own trigger.
 */
export function EditorReadiness() {
  const readiness = useReadiness();
  const t = useTranslations("editor.readiness");
  const [open, setOpen] = useState(false);
  const jumpTarget = useRef<ReadinessTarget | null>(null);

  if (!readiness) return <EditorReadinessSkeleton />;
  const ready = readiness.percent === 100;

  const onJump = (target: ReadinessTarget) => {
    jumpTarget.current = target;
    setOpen(false);
    openCheckTarget(target);
  };

  const finalFocus = () => {
    const target = jumpTarget.current;
    jumpTarget.current = null;
    if (target === null) return true;
    // Below xl the field sits in the edit sheet, which focuses it as it opens.
    if (useEditorChromeStore.getState().sheetOpen) return false;
    return findCheckField(target) ?? true;
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 shrink-0 gap-1.5 px-2"
            />
          }
        >
          <EditorReadinessLabel percent={readiness.percent} />
          <CaretDownIcon className="text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80" finalFocus={finalFocus}>
          <PopoverHeader>
            <PopoverTitle>{ready ? t("readyTitle") : t("title")}</PopoverTitle>
            <PopoverDescription>
              {ready ? t("readyDescription") : t("description")}
            </PopoverDescription>
          </PopoverHeader>
          <EditorReadinessList checks={readiness.checks} onJump={onJump} />
        </PopoverContent>
      </Popover>
      <Progress
        value={readiness.percent}
        aria-label={t("title")}
        className="flex-1"
      />
    </>
  );
}
