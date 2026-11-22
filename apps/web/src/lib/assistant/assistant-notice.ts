import type { Resume } from "@lanjut/resume";
import { F } from "@mobily/ts-belt";
import { toast } from "sonner";
import { useResumeStore } from "@/lib/store/resume-store";

const NOTICE_ID = "assistant-change";
const NOTICE_MS = 8000;

export interface NoticeMessages {
  changed: string;
  undo: string;
}

let stopWatching: () => void = F.ignore;

function dismiss() {
  stopWatching();
  stopWatching = F.ignore;
  toast.dismiss(NOTICE_ID);
}

/**
 * Tells the person that an assistant changed the open résumé. Undo takes back
 * that change only: the notice leaves as soon as the résumé changes again, so
 * its Undo never takes back an edit of the person's.
 */
export function showAssistantNotice(written: Resume, messages: NoticeMessages) {
  dismiss();
  stopWatching = useResumeStore.subscribe((state) => {
    if (state.open !== written) dismiss();
  });
  toast(messages.changed, {
    id: NOTICE_ID,
    duration: NOTICE_MS,
    action: {
      label: messages.undo,
      onClick: () => {
        stopWatching();
        if (useResumeStore.getState().open === written) {
          useResumeStore.getState().undo();
        }
      },
    },
    onDismiss: dismiss,
    onAutoClose: dismiss,
  });
}
