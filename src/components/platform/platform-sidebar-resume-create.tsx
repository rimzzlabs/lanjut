"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "../ui/button";
import { PlatformResumeCreateDialog } from "./platform-resume-create-dialog";

export function PlatformSidebarResumeCreate() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("platform.sidebar");

  return (
    <>
      <Button
        size="icon-xs"
        className="ml-auto"
        variant="ghost"
        onClick={() => setOpen(true)}
      >
        <Plus /> <span className="sr-only">{t("createResume")}</span>
      </Button>

      <PlatformResumeCreateDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
