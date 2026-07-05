"use client";

import { useState } from "react";
import {
  downloadResume,
  type ExportFormat,
} from "@/components/editor/download-resume";
import { getResume } from "@/lib/db";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../shared/responsive-dialog";
import { PlatformResumeDownloadForm } from "./platform-resume-download-form";

interface PlatformResumeActionDownloadProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  resume: { id: string; title: string };
}

export function PlatformResumeActionDownload(
  props: PlatformResumeActionDownloadProps,
) {
  const [generating, setGenerating] = useState(false);
  const [missing, setMissing] = useState(false);

  async function handleDownload(format: ExportFormat, fileName: string) {
    setGenerating(true);
    try {
      const document = await getResume(props.resume.id).catch(() => undefined);
      if (!document) {
        setMissing(true);
        return;
      }
      await downloadResume(document, format, fileName);
      props.onOpenChange(false);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Download {props.resume.title}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Pick a format and name your file. The export is generated in your
            browser.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {missing ? (
          <p className="text-sm text-destructive">
            This résumé could not be loaded from this browser's storage.
          </p>
        ) : (
          <PlatformResumeDownloadForm
            key={props.resume.title}
            defaultFileName={props.resume.title}
            generating={generating}
            onSubmit={(format, fileName) =>
              void handleDownload(format, fileName)
            }
          />
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
