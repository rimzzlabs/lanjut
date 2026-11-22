import { D, O } from "@mobily/ts-belt";
import {
  type AssistantActivity,
  type AssistantChange,
  useAssistantActivityStore,
} from "@/lib/store/assistant-activity-store";
import { useResumeStore } from "@/lib/store/resume-store";

/** What an AI assistant does on the open résumé, if anything. */
export function useOpenAssistantActivity(): AssistantActivity | undefined {
  const id = useResumeStore((state) => state.open?.id);
  return useAssistantActivityStore((state) =>
    id ? O.toUndefined(D.get(state.activity, id)) : undefined,
  );
}

/** The parts of the open résumé that an assistant's last write changed. */
export function useOpenAssistantChange(): AssistantChange | undefined {
  const id = useResumeStore((state) => state.open?.id);
  return useAssistantActivityStore((state) =>
    id ? O.toUndefined(D.get(state.changes, id)) : undefined,
  );
}
