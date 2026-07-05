"use client";

import { PenLine } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { EditorSidebarContent } from "./editor-sidebar-content";

export function EditorSheet() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button size="lg" className="fixed right-4 bottom-4 z-40 shadow-lg" />
        }
      >
        <PenLine /> Edit
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
        <SheetTitle className="sr-only">Editor</SheetTitle>
        <ScrollArea className="min-h-0 flex-1">
          <EditorSidebarContent />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
