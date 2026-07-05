"use client";

import { Download } from "lucide-react";
import { usePathname } from "next/navigation";
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
        <Download /> <span className="sr-only">Download</span> Résumé
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>Download résumé</PopoverTitle>
          <PopoverDescription>
            Pick a format and name your file.
          </PopoverDescription>
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
