import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@lanjut/ui/components/alert";
import { WarningIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { unquarantineCommand } from "@/lib/assistant/assistant-connect";
import type { AssistantStatus } from "@/lib/store/assistant-store";
import { ProfileAssistantCopyBlock } from "./profile-assistant-copy-block";

/**
 * Why no assistant can start the helper, in place of the connect actions.
 * macOS kills a quarantined helper and offers to move all of Lanjut to the
 * Trash, so the command that clears it comes first.
 */
export function ProfileAssistantRelayNotice(props: {
  status: AssistantStatus;
}) {
  const { status } = props;
  const t = useTranslations("profile.assistant");

  if (status.relayProblem === "missing" || !status.relayPath) {
    return (
      <Alert variant="destructive">
        <WarningIcon />
        <AlertTitle>{t("missingTitle")}</AlertTitle>
        <AlertDescription>{t("missingDescription")}</AlertDescription>
      </Alert>
    );
  }
  if (status.relayProblem !== "quarantined" || !status.appBundlePath) {
    return null;
  }
  return (
    <Alert>
      <WarningIcon />
      <AlertTitle>{t("quarantineTitle")}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{t("quarantineDescription")}</span>
        <ProfileAssistantCopyBlock
          label={t("copyCommand")}
          text={unquarantineCommand(status.appBundlePath)}
        />
      </AlertDescription>
    </Alert>
  );
}
