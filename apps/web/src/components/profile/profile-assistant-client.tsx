import { Button } from "@lanjut/ui/components/button";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import {
  type AssistantClient,
  type ConnectAction,
  connectAction,
} from "@/lib/assistant/assistant-connect";
import { openExternal } from "@/lib/open-external";
import { ProfileAssistantCopyBlock } from "./profile-assistant-copy-block";

interface ProfileAssistantClientProps {
  client: AssistantClient;
  relayPath: string;
}

/** One assistant: its name, what to do, and the action. */
export function ProfileAssistantClient(props: ProfileAssistantClientProps) {
  const t = useTranslations("profile.assistant.clients");
  const action = connectAction(props.client, props.relayPath);

  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{t(`${props.client}.name`)}</span>
        <span className="text-sm text-muted-foreground">
          {t(`${props.client}.description`)}
        </span>
      </div>
      <ProfileAssistantClientAction client={props.client} action={action} />
    </li>
  );
}

function ProfileAssistantClientAction(props: {
  client: AssistantClient;
  action: ConnectAction;
}) {
  const t = useTranslations("profile.assistant");
  const clients = useTranslations("profile.assistant.clients");
  const label = clients(`${props.client}.action`);

  if (props.action.kind === "copy") {
    return <ProfileAssistantCopyBlock label={label} text={props.action.text} />;
  }

  const url = props.action.url;
  async function open() {
    try {
      await openExternal(url);
    } catch {
      toast.error(t("openFailed"));
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="self-start"
      onClick={() => void open()}
    >
      <ArrowSquareOutIcon data-icon="inline-start" />
      {label}
    </Button>
  );
}
