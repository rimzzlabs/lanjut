"use client";

import { FilePlus2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PlatformResumeCreateDialog } from "../platform-resume-create-dialog";

export function PlatformResumeGridItemNew() {
  const [open, setOpen] = useState(false);

  return (
    <Empty className="py-4 gap-2 border border-dashed">
      <EmptyHeader className="gap-1">
        <EmptyMedia variant="icon" className="size-7">
          <FilePlus2 className="size-3.5" />
        </EmptyMedia>

        <EmptyTitle className="text-sm">Add Résumé</EmptyTitle>
        <EmptyDescription className="sr-only">Add more resume</EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <Plus /> Résumé
        </Button>

        <PlatformResumeCreateDialog open={open} onOpenChange={setOpen} />
      </EmptyContent>
    </Empty>
  );
}
