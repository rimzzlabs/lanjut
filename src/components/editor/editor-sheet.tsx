"use client";

import { PenLine } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { EditorSidebarContent } from "./editor-sidebar-content";

export function EditorSheet() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            id="tour-editor-edit"
            size="lg"
            className="fixed right-4 bottom-4 z-40 shadow-lg"
          />
        }
      >
        <PenLine /> Edit
      </SheetTrigger>

      <SheetContent
        side="right"
        className="data-[side=right]:w-11/12 md:data-[side=right]:w-3/4 gap-0 sm:max-w-lg"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Editor</SheetTitle>
          <SheetDescription>Resume Editor</SheetDescription>
        </SheetHeader>
        <div className="flex-1">
          <EditorSidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
