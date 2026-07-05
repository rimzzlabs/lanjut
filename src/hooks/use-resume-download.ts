"use client";

import { useState } from "react";
import {
  downloadResume,
  type ExportFormat,
} from "@/components/editor/download-resume";
import { useResumeStore } from "@/lib/store";

export function useResumeDownload() {
  const resume = useResumeStore((state) => state.open);
  const [generating, setGenerating] = useState(false);

  async function download(format: ExportFormat, fileName: string) {
    if (!resume) return false;
    setGenerating(true);
    try {
      await downloadResume(resume, format, fileName);
      return true;
    } finally {
      setGenerating(false);
    }
  }

  return { resume, generating, download };
}
