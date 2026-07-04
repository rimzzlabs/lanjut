"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { PlatformResumeCreateDialog } from "./platform-resume-create-dialog";

export function PlatformSidebarResumeCreate() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="icon-xs"
        className="ml-auto"
        variant="ghost"
        onClick={() => setOpen(true)}
      >
        <Plus /> <span className="sr-only">Create Résumé</span>
      </Button>

      <PlatformResumeCreateDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
