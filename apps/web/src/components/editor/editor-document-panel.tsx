import { Separator } from "@lanjut/ui/components/separator";
import {
  DownloadSimpleIcon,
  FloppyDiskBackIcon,
  TrayArrowUpIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { ResumeImportDisclaimer } from "@/components/shared/resume-import-disclaimer";
import { EditorDocumentBackup } from "./editor-document-backup";
import { EditorDocumentDownload } from "./editor-document-download";
import { EditorDocumentImport } from "./editor-document-import";
import { EditorDocumentPaste } from "./editor-document-paste";
import { EditorPanelSection } from "./editor-panel-section";

/**
 * The Document tab, grouped by what the person wants to do with the résumé:
 * send it, keep a copy of it, or bring one in.
 */
export function EditorDocumentPanel() {
  const t = useTranslations("editor.document");

  return (
    <div className="flex flex-col divide-y px-4">
      <EditorPanelSection
        icon={<DownloadSimpleIcon />}
        title={t("downloadHeading")}
        description={t("downloadHint")}
      >
        <EditorDocumentDownload />
      </EditorPanelSection>

      <EditorPanelSection
        icon={<FloppyDiskBackIcon />}
        title={t("backupHeading")}
        description={t("backupHint")}
      >
        <EditorDocumentBackup />
      </EditorPanelSection>

      <EditorPanelSection
        icon={<TrayArrowUpIcon />}
        title={t("importHeading")}
        description={t("importHint")}
      >
        <EditorDocumentImport />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          {t("or")}
          <Separator className="flex-1" />
        </div>
        <EditorDocumentPaste />
        <ResumeImportDisclaimer />
      </EditorPanelSection>
    </div>
  );
}
