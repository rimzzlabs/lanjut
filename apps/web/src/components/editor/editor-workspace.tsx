import { EditLockFrame } from "@/components/shared/edit-lock-frame";
import { useEditLock } from "@/hooks/use-edit-lock";
import { useEditorId } from "@/hooks/use-editor-id";
import type { EditLockHooks } from "@/lib/edit-lock";
import { flushOpenResumePersist } from "@/lib/store/persistence";
import { reloadOpenResume } from "@/lib/store/resume-store-windows";
import { EditorConflictNotice } from "./editor-conflict-notice";
import { EditorPageContent } from "./editor-page";
import { EditorPanels } from "./editor-panels";

// Before this window gives the résumé up, it writes what is pending. After it
// takes the résumé over, it reads what the other window wrote.
const RESUME_LOCK: EditLockHooks = {
  beforeRelease: flushOpenResumePersist,
  afterTake: reloadOpenResume,
};

/** The editor, shown at `/editor/<id>`. */
export function EditorWorkspace() {
  const id = useEditorId();

  if (!id) return null;
  return <EditorLockedWorkspace id={id} />;
}

/** One window edits a résumé at a time: another window that opens it is frozen. */
function EditorLockedWorkspace(props: { id: string }) {
  const lock = useEditLock("resume", props.id, RESUME_LOCK);

  return (
    <>
      <EditLockFrame
        item="resume"
        frozen={lock.frozen}
        taking={lock.taking}
        onTakeOver={lock.takeOver}
        centered
        className="h-full min-h-0"
      >
        <EditorPanels>
          <EditorPageContent />
        </EditorPanels>
      </EditLockFrame>
      <EditorConflictNotice />
    </>
  );
}
