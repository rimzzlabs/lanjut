import { Button } from "@lanjut/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@lanjut/ui/components/sheet";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useEditorChromeStore } from "@/lib/store";
import { takeJumpField } from "./editor-readiness/check-target";
import { EditorSidebarContent } from "./editor-sidebar-content";
import { EditorUndoRedo } from "./editor-undo-redo";

export function EditorSheet() {
  const t = useTranslations("editor.chrome");
  const open = useEditorChromeStore((state) => state.sheetOpen);
  const setSheetOpen = useEditorChromeStore((state) => state.setSheetOpen);

  return (
    <Sheet open={open} onOpenChange={setSheetOpen}>
      <SheetTrigger
        render={
          <Button
            id="tour-editor-edit"
            size="lg"
            className="fixed right-4 bottom-4 z-40 shadow-lg"
          />
        }
      >
        <PencilSimpleLineIcon /> {t("edit")}
      </SheetTrigger>

      <SheetContent
        side="right"
        initialFocus={takeJumpField}
        className="data-[side=right]:w-11/12 md:data-[side=right]:w-3/4 gap-0 sm:max-w-lg"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t("editorTitle")}</SheetTitle>
          <SheetDescription>{t("editorDescription")}</SheetDescription>
        </SheetHeader>
        {/* Undo and redo share the close button's row: under the tabs, a
            narrow phone has no room for them. */}
        <div className="flex shrink-0 items-center px-3 pt-4">
          <EditorUndoRedo />
        </div>
        <div className="min-h-0 flex-1">
          <EditorSidebarContent className="pt-0" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
