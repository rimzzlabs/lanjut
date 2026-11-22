import { useTranslations } from "use-intl";
import { useOpenAssistantActivity } from "@/hooks/use-open-assistant-activity";
import { IS_DESKTOP } from "@/lib/build-target";
import type { AssistantActivity } from "@/lib/store/assistant-activity-store";
import { EditorAssistantClientIcon } from "./editor-assistant-client-icon";

/**
 * Tells the person that an AI assistant works on the open résumé: while it
 * reads or writes it, and for a short while after. It sits at the top of the
 * page, where the changes show, and takes no room of its own.
 */
export function EditorAssistantChip() {
  const activity = useOpenAssistantActivity();

  if (!IS_DESKTOP || !activity) return null;
  return (
    <div className="pointer-events-none sticky top-3 z-10 flex h-0 justify-center">
      <EditorAssistantChipBody activity={activity} />
    </div>
  );
}

function EditorAssistantChipBody(props: { activity: AssistantActivity }) {
  const { activity } = props;
  const t = useTranslations("editor.assistant");
  const label = activity.client
    ? t("workingNamed", { name: activity.client })
    : t("working");

  return (
    <output className="flex h-7 max-w-[min(24rem,calc(100%-2rem))] items-center gap-2 rounded-full border bg-background/95 px-3 text-xs font-medium shadow-sm">
      <EditorAssistantClientIcon client={activity.client} />
      <span className="truncate">{label}</span>
      <span
        aria-hidden
        data-busy={activity.busy > 0}
        className="size-2 shrink-0 rounded-full bg-primary data-[busy=true]:animate-pulse motion-reduce:animate-none"
      />
    </output>
  );
}
