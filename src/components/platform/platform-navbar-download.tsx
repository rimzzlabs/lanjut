"use client";

import { Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { useResumeStore } from "@/lib/store";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export function PlatformNavbarDownload() {
  const pathname = usePathname();
  const open = useResumeStore((state) => state.open);
  const [generating, setGenerating] = useState(false);

  if (!pathname.includes("/editor/")) return null;

  const onDownload = async () => {
    if (!open) return;
    setGenerating(true);
    try {
      // Lazy-loaded so @react-pdf stays out of the main bundle until needed.
      const { downloadResumePdf } = await import(
        "@/components/editor/pdf/download-resume-pdf"
      );
      await downloadResumePdf(resumeToPreview(open), open.title);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button onClick={onDownload} disabled={!open || generating}>
      {generating ? <Spinner /> : <Download />} Download Résumé
    </Button>
  );
}
