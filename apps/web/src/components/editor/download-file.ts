import { A, O, pipe, S } from "@mobily/ts-belt";
import type { DialogFilter } from "@tauri-apps/plugin-dialog";
import { IS_DESKTOP } from "@/lib/build-target";

/**
 * Sanitizes a user-typed file name: strips characters illegal in file names and
 * a redundant trailing extension, preserving spaces and case. Falls back to
 * "resume" when nothing usable remains.
 */
export function safeFileName(name: string): string {
  const cleaned = pipe(
    name,
    S.replaceByRe(/\.(pdf|docx|txt|json|ya?ml)$/i, ""),
    S.replaceByRe(/[\\/:*?"<>|]+/g, "-"),
    S.trim,
  );
  return cleaned || "resume";
}

const EXTENSION_LABEL: Record<string, string> = {
  pdf: "PDF document",
  docx: "Word document",
  txt: "Plain text",
  json: "JSON",
  yaml: "YAML",
};

function saveFilters(extension: string): DialogFilter[] {
  if (!extension) return [];
  return [
    { name: EXTENSION_LABEL[extension] ?? extension, extensions: [extension] },
  ];
}

async function saveThroughDialog(blob: Blob, fileName: string) {
  const [{ save }, { writeFile }] = await Promise.all([
    import("@tauri-apps/plugin-dialog"),
    import("@tauri-apps/plugin-fs"),
  ]);

  const extension = pipe(fileName, S.split("."), A.last, O.getWithDefault(""));
  const path = await save({
    defaultPath: fileName,
    filters: saveFilters(extension),
  });
  if (!path) return false;

  await writeFile(path, new Uint8Array(await blob.arrayBuffer()));
  return true;
}

/**
 * Writes `blob` out as `fileName`. Resolves false when the user backs out.
 *
 * The browser takes an anchor click and drops the file in its download
 * directory. The system webview ignores that click entirely, so the desktop
 * build asks for a destination and writes the bytes itself. The save dialog
 * grants filesystem access to the chosen file alone, which is why this needs no
 * broad write permission.
 */
export async function triggerDownload(
  blob: Blob,
  fileName: string,
): Promise<boolean> {
  if (IS_DESKTOP) return saveThroughDialog(blob, fileName);

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}
