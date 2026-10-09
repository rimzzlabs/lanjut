/** The structured-text formats a résumé backs up to and restores from. */
export type BackupFormat = "json" | "yaml";

export const BACKUP_FORMATS: ReadonlyArray<BackupFormat> = ["json", "yaml"];
