import { create } from "zustand";

/** A résumé that an assistant asks to delete, until the person answers. */
interface DeleteRequest {
  id: string;
  title: string;
}

interface AssistantRequestState {
  deleteRequest: DeleteRequest | null;
}

export const useAssistantRequestStore = create<AssistantRequestState>(() => ({
  deleteRequest: null,
}));

let answer: (deleted: boolean) => void = () => undefined;

/** The person answers in the delete dialog, or the wait runs out. */
const ASK_TIMEOUT_MS = 110_000;

/**
 * Shows the library's delete dialog for the résumé and resolves with the
 * person's answer: true when they deleted it. An assistant never deletes on
 * its own.
 */
export function askToDelete(request: DeleteRequest): Promise<boolean> {
  answer(false);
  return new Promise((resolve) => {
    const timer = setTimeout(() => settle(false), ASK_TIMEOUT_MS);
    function settle(deleted: boolean) {
      clearTimeout(timer);
      answer = () => undefined;
      useAssistantRequestStore.setState({ deleteRequest: null });
      resolve(deleted);
    }
    answer = settle;
    useAssistantRequestStore.setState({ deleteRequest: request });
  });
}

export function answerDelete(deleted: boolean): void {
  answer(deleted);
}
