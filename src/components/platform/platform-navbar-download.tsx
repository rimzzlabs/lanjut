"use client";

import { Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  downloadResume,
  type ExportFormat,
} from "@/components/editor/download-resume";
import { useResumeStore } from "@/lib/store";
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
  const open = useResumeStore((state) => state.open);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  if (!pathname.includes("/editor/")) return null;

  const onDownload = async (format: ExportFormat, fileName: string) => {
    if (!open) return;
    setGenerating(true);
    try {
      await downloadResume(open, format, fileName);
      setPopoverOpen(false);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger render={<Button disabled={!open} />}>
        <Download /> Download Résumé
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>Download résumé</PopoverTitle>
          <PopoverDescription>
            Pick a format and name your file.
          </PopoverDescription>
        </PopoverHeader>

        <PlatformResumeDownloadForm
          key={`${open?.id}-${popoverOpen}`}
          defaultFileName={open?.title ?? ""}
          generating={generating}
          onSubmit={(format, fileName) => void onDownload(format, fileName)}
        />
      </PopoverContent>
    </Popover>
  );
}
