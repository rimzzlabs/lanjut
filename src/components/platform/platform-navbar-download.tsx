"use client";

import { Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useIsClient } from "@/hooks/use-is-client";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { PlatformResumeDownloadDrawer } from "./platform-resume-download-drawer";
import { PlatformResumeDownloadForm } from "./platform-resume-download-form";

export function PlatformNavbarDownload() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isClient = useIsClient();
  const t = useTranslations("platform.download");
  const { resume, generating, download } = useResumeDownload();
  const [open, setOpen] = useState(false);

  if (!pathname.includes("/editor/") || !isClient) return null;

  if (isMobile) {
    return (
      <>
        <Button
          id="tour-download"
          size="icon"
          disabled={!resume}
          onClick={() => setOpen(true)}
        >
          <Download />
          <span className="sr-only">{t("srDownload")}</span>
        </Button>
        <PlatformResumeDownloadDrawer open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button id="tour-download" disabled={!resume} />}>
        <Download /> <span className="sr-only">{t("srDownload")}</span>{" "}
        {t("trigger")}
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>{t("title")}</PopoverTitle>
          <PopoverDescription>{t("description")}</PopoverDescription>
        </PopoverHeader>

        <PlatformResumeDownloadForm
          key={`${resume?.id}-${open}`}
          defaultFileName={resume?.title ?? ""}
          generating={generating}
          onSubmit={(format, fileName) =>
            void download(format, fileName).then(
              (done) => done && setOpen(false),
            )
          }
        />
      </PopoverContent>
    </Popover>
  );
}
