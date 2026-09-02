"use client";

import { Redo2, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
          <Undo2 />
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
          <Redo2 />
          <span className="sr-only">{t("redo")}</span>
        </TooltipTrigger>
        <TooltipContent>{t("redo")}</TooltipContent>
      </Tooltip>
    </div>
  );
}
