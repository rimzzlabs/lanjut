import { Alert, AlertDescription } from "@lanjut/ui/components/alert";
import { WarningIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import type { AssistantStatus } from "@/lib/store/assistant-store";

/** Whether the server serves, and how many assistants are connected now. */
export function ProfileAssistantState(props: { status: AssistantStatus }) {
  const { status } = props;
  const t = useTranslations("profile.assistant");

  if (status.startError) {
    return (
      <Alert variant="destructive">
        <WarningIcon />
        <AlertDescription>
          {t(status.startError === "inUse" ? "startInUse" : "startFailed")}
        </AlertDescription>
      </Alert>
    );
  }

  const connected = status.connections > 0;
  return (
    <output className="flex items-center gap-2 text-sm">
      <span
        aria-hidden
        data-connected={connected}
        className="size-2 shrink-0 rounded-full bg-muted-foreground/50 data-[connected=true]:bg-primary"
      />
      {connected ? t("connected", { count: status.connections }) : t("waiting")}
    </output>
  );
}
