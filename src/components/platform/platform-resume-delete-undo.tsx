import { toast } from "sonner";
import { useResumeStore } from "@/lib/store";
import { ResumeDeleteCountdown } from "./platform-resume-delete-countdown";

const UNDO_WINDOW_MS = 10_000;

interface UndoMessages {
  deleted: string;
  undo: string;
}

// Runs the timer outside React so it survives the résumé card unmounting when
// the entry leaves the index.
export function deleteResumeWithUndo(id: string, messages: UndoMessages) {
  const store = useResumeStore.getState();
  const entry = store.detachResume(id);
  if (!entry) return;

  let settled = false;
  const timer = setTimeout(() => {
    if (settled) return;
    settled = true;
    void store.removeResume(id);
  }, UNDO_WINDOW_MS);

  toast(messages.deleted, {
    duration: UNDO_WINDOW_MS,
    className: "resume-delete-toast",
    icon: <ResumeDeleteCountdown seconds={UNDO_WINDOW_MS / 1000} />,
    action: {
      label: messages.undo,
      onClick: () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        store.restoreResume(entry);
      },
    },
  });
}
