import { Switch } from "@lanjut/ui/components/switch";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useAssistantStore } from "@/lib/store/assistant-store";
import { ProfileAssistantClients } from "./profile-assistant-clients";
import { ProfileAssistantEnableDialog } from "./profile-assistant-enable-dialog";
import { ProfileAssistantRelayNotice } from "./profile-assistant-relay-notice";
import { ProfileAssistantState } from "./profile-assistant-state";
import { ProfilePreferenceRow } from "./profile-preference-row";
import { ProfileSettingsHeading } from "./profile-settings-heading";

/** Work with an AI assistant: the switch, and how to connect each assistant. */
export function ProfileSettingsAssistant() {
  const t = useTranslations("profile.assistant");
  const status = useAssistantStore((state) => state.status);
  const changing = useAssistantStore((state) => state.changing);
  const setEnabled = useAssistantStore((state) => state.setEnabled);
  const [asking, setAsking] = useState(false);
  const enabled = status?.enabled ?? false;

  async function change(next: boolean) {
    if (await setEnabled(next)) return;
    toast.error(t("changeFailed"));
  }

  function onCheckedChange(checked: boolean) {
    // The person reads what the switch shares before it turns on.
    if (checked) {
      setAsking(true);
      return;
    }
    void change(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <ProfileSettingsHeading
        title={t("title")}
        description={t("description")}
      />

      <div className="flex flex-col divide-y">
        <ProfilePreferenceRow
          label={t("switch")}
          description={t("switchDescription")}
        >
          <Switch
            aria-label={t("switch")}
            checked={enabled}
            disabled={status === null || changing}
            onCheckedChange={onCheckedChange}
          />
        </ProfilePreferenceRow>
      </div>

      {status?.enabled && (
        <div className="flex flex-col gap-6">
          <ProfileAssistantState status={status} />
          <ProfileAssistantRelayNotice status={status} />
          {status.relayPath && status.relayProblem === null && (
            <ProfileAssistantClients relayPath={status.relayPath} />
          )}
        </div>
      )}

      <ProfileAssistantEnableDialog
        open={asking}
        onOpenChange={setAsking}
        onConfirm={() => {
          setAsking(false);
          void change(true);
        }}
      />
    </div>
  );
}
