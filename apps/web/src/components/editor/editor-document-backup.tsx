import type { Resume } from "@lanjut/resume";
import { resumeToJson, resumeToYaml } from "@lanjut/resume/interchange";
import { Button } from "@lanjut/ui/components/button";
import { CopyIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useResumeDownload } from "@/hooks/use-resume-download";
import type { BackupFormat } from "./backup-format";
import { EditorDocumentBackupFormat } from "./editor-document-backup-format";

const SERIALIZE: Record<BackupFormat, (resume: Resume) => string> = {
  json: resumeToJson,
  yaml: resumeToYaml,
};

/** Copy or download the open résumé as JSON or YAML, to keep or edit. */
export function EditorDocumentBackup() {
  const { resume, generating, download } = useResumeDownload();
  const t = useTranslations("editor.document");
  const [format, setFormat] = useState<BackupFormat>("json");
  if (!resume) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SERIALIZE[format](resume));
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <EditorDocumentBackupFormat value={format} onValueChange={setFormat} />
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={() => void copy()}>
          <CopyIcon />
          {t("copy")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={generating}
          onClick={() => void download(format, resume.title)}
        >
          <DownloadSimpleIcon />
          {t("downloadFile")}
        </Button>
      </div>
    </div>
  );
}
