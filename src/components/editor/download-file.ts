/**
 * Sanitizes a user-typed file name: strips characters illegal in file names and
 * a redundant trailing extension, preserving spaces and case. Falls back to
 * "resume" when nothing usable remains.
 */
export function safeFileName(name: string): string {
  const cleaned = name
    .replace(/\.(pdf|docx|txt)$/i, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .trim();
  return cleaned || "resume";
}

/** Triggers a browser download of `blob` as `fileName`, revoking the object URL. */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
