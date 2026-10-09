import { A, S } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { BACKUP_FORMATS, type BackupFormat } from "./backup-format";

const ITEMS = A.map(BACKUP_FORMATS, (format) => ({
  value: format,
  label: S.toUpperCase(format),
}));

/** Picks the format that the Backup section copies and downloads. */
export function EditorDocumentBackupFormat(props: {
  value: BackupFormat;
  onValueChange: (format: BackupFormat) => void;
}) {
  const t = useTranslations("editor.document");
  return (
    <SegmentedControl
      aria-label={t("backupFormat")}
      value={props.value}
      onValueChange={(value) => props.onValueChange(value as BackupFormat)}
      items={ITEMS}
    />
  );
}
