import { useResumeDownload } from "@/hooks/use-resume-download";
import { PlatformResumeDownloadForm } from "../platform/platform-resume-download-form";
import type { ExportFormat } from "./export-format";

// JSON and YAML live in the Backup section, beside copying them.
const SEND_FORMATS: ReadonlyArray<ExportFormat> = ["pdf", "docx", "txt"];

/** The résumé export form for the files a person sends, in the Document tab. */
export function EditorDocumentDownload() {
  const { resume, generating, download } = useResumeDownload();
  if (!resume) return null;
  return (
    <PlatformResumeDownloadForm
      key={resume.id}
      defaultFileName={resume.title}
      formats={SEND_FORMATS}
      generating={generating}
      onSubmit={(format, fileName) => void download(format, fileName)}
    />
  );
}
