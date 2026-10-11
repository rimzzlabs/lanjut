import type { RevisionError } from "@lanjut/resume/db";
import { useTranslations } from "use-intl";
import { ConflictDialog } from "@/components/shared/conflict-dialog";
import { useRouter } from "@/i18n/navigation";
import { EDITOR_PATHNAME, editorHref } from "@/lib/routes";
import { useResumeStore, useSaveStatusStore } from "@/lib/store";
import type { SaveStatus } from "@/lib/store/save-status-store";

function conflictOf(status: SaveStatus): RevisionError | null {
  if (status === "changed" || status === "deleted") return status;
  return null;
}

/** Asks which version to keep when another window saved or deleted the open résumé first. */
export function EditorConflictNotice() {
  const t = useTranslations("platform.grid");
  const router = useRouter();
  const kind = useSaveStatusStore((state) => conflictOf(state.status));
  const reloadOpen = useResumeStore((state) => state.reloadOpen);
  const restoreOpen = useResumeStore((state) => state.restoreOpen);
  const closeOpen = useResumeStore((state) => state.closeOpen);
  const duplicateResume = useResumeStore((state) => state.duplicateResume);

  async function saveCopy() {
    const open = useResumeStore.getState().open;
    if (!open) return;
    const title = t("copyOf", { title: open.title });
    const copy = await duplicateResume(open.id, title);
    if (copy) await router.push(editorHref(copy.id));
  }

  async function close() {
    await router.push(EDITOR_PATHNAME);
    closeOpen();
  }

  return (
    <ConflictDialog
      kind={kind}
      item="resume"
      onKeepOther={() => void reloadOpen()}
      onSaveCopy={() => void saveCopy()}
      onRestore={() => void restoreOpen()}
      onClose={() => void close()}
    />
  );
}
