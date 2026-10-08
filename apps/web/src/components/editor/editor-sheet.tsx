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
import { EditorSidebarContent } from "./editor-sidebar-content";

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
        className="data-[side=right]:w-11/12 md:data-[side=right]:w-3/4 gap-0 sm:max-w-lg"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t("editorTitle")}</SheetTitle>
          <SheetDescription>{t("editorDescription")}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1">
          <EditorSidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
