import { PlatformResumeActionDelete } from "@/components/platform/platform-resume-action-delete";
import {
  answerDelete,
  useAssistantRequestStore,
} from "@/lib/store/assistant-request-store";

/** The delete dialog that an assistant asks for. The person decides. */
export function AssistantDeleteRequest() {
  const request = useAssistantRequestStore((state) => state.deleteRequest);

  if (!request) return null;
  return (
    <PlatformResumeActionDelete
      open
      resume={request}
      onDeleted={() => answerDelete(true)}
      onOpenChange={(next) => {
        if (!next) answerDelete(false);
      }}
    />
  );
}
