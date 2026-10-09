import { Button } from "@lanjut/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lanjut/ui/components/tooltip";
import { ArrowUUpLeftIcon, ArrowUUpRightIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";

export function EditorUndoRedo() {
  const canUndo = useResumeStore((state) => state.canUndo);
  const canRedo = useResumeStore((state) => state.canRedo);
  const undo = useResumeStore((state) => state.undo);
  const redo = useResumeStore((state) => state.redo);
  const t = useTranslations("editor.chrome");

  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={!canUndo}
              onClick={() => undo()}
            />
          }
        >
          <ArrowUUpLeftIcon />
          <span className="sr-only">{t("undo")}</span>
        </TooltipTrigger>
        <TooltipContent>{t("undo")}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={!canRedo}
              onClick={() => redo()}
            />
          }
        >
          <ArrowUUpRightIcon />
          <span className="sr-only">{t("redo")}</span>
        </TooltipTrigger>
        <TooltipContent>{t("redo")}</TooltipContent>
      </Tooltip>
    </div>
  );
}
