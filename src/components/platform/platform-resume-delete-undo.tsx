import { toast } from "sonner";
import { useResumeStore } from "@/lib/store";
import { ResumeDeleteCountdown } from "./platform-resume-delete-countdown";

const UNDO_WINDOW_MS = 10_000;

interface UndoMessages {
  deleted: string;
  undo: string;
}

// The résumé is deleted from disk right away so it can never resurface, even if
// the page is left mid-window. Undo restores the removed document.
export async function deleteResumeWithUndo(id: string, messages: UndoMessages) {
  const store = useResumeStore.getState();
  const removed = await store.removeResume(id);
  if (!removed) return;

  toast(messages.deleted, {
    duration: UNDO_WINDOW_MS,
    className: "resume-delete-toast",
    icon: <ResumeDeleteCountdown seconds={UNDO_WINDOW_MS / 1000} />,
    action: {
      label: messages.undo,
      onClick: () => {
        void store.restoreResume(removed);
      },
    },
  });
}
