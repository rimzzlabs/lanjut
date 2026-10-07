import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { PlatformResumeCreateDialog } from "./platform-resume-create-dialog";

export function PlatformSidebarResumeCreate() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("platform.sidebar");

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon-xs"
              className="ml-auto"
              variant="ghost"
              onClick={() => setOpen(true)}
            />
          }
        >
          <PlusIcon /> <span className="sr-only">{t("createResume")}</span>
        </TooltipTrigger>
        <TooltipContent>{t("createResume")}</TooltipContent>
      </Tooltip>

      <PlatformResumeCreateDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
