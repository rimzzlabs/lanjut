"use client";

import { Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useResumeDownload } from "@/hooks/use-resume-download";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover";
import { PlatformResumeDownloadForm } from "./platform-resume-download-form";

export function PlatformNavbarDownload() {
  const pathname = usePathname();
  const t = useTranslations("platform.download");
  const { resume, generating, download } = useResumeDownload();
  const [popoverOpen, setPopoverOpen] = useState(false);

  if (!pathname.includes("/editor/")) return null;

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger
        render={
          <Button
            id="tour-download"
            disabled={!resume}
            className="max-md:hidden"
          />
        }
      >
        <Download /> <span className="sr-only">{t("srDownload")}</span>{" "}
        {t("trigger")}
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>{t("title")}</PopoverTitle>
          <PopoverDescription>{t("description")}</PopoverDescription>
        </PopoverHeader>

        <PlatformResumeDownloadForm
          key={`${resume?.id}-${popoverOpen}`}
          defaultFileName={resume?.title ?? ""}
          generating={generating}
          onSubmit={(format, fileName) =>
            void download(format, fileName).then(
              (done) => done && setPopoverOpen(false),
            )
          }
        />
      </PopoverContent>
    </Popover>
  );
}
