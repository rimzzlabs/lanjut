"use client";

import { useResumeDownload } from "@/hooks/use-resume-download";
import { PlatformResumeDownloadForm } from "../platform/platform-resume-download-form";

/** The résumé export form, hosted inline in the Document tab. */
export function EditorDocumentDownload() {
  const { resume, generating, download } = useResumeDownload();
  if (!resume) return null;
  return (
    <PlatformResumeDownloadForm
      key={resume.id}
      defaultFileName={resume.title}
      generating={generating}
      onSubmit={(format, fileName) => void download(format, fileName)}
    />
  );
}
