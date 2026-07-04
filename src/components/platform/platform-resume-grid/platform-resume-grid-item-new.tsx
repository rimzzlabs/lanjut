"use client";

import { FilePlus2 } from "lucide-react";
import { useState } from "react";
import { PlatformResumeCreateDialog } from "../platform-resume-create-dialog";

export function PlatformResumeGridItemNew() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-full min-h-56 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[min(var(--radius-4xl),24px)] border border-dashed text-muted-foreground transition-colors hover:border-ring/60 hover:bg-muted/40 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <span className="flex size-10 items-center justify-center rounded-xl border bg-muted/60">
          <FilePlus2 className="size-4" />
        </span>
        <span className="text-sm font-medium">New résumé</span>
      </button>

      <PlatformResumeCreateDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
