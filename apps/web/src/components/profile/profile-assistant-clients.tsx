import { useTranslations } from "use-intl";
import { ASSISTANT_CLIENTS } from "@/lib/assistant/assistant-connect";
import { ProfileAssistantClient } from "./profile-assistant-client";

/** One row for each assistant, with the one action that connects it. */
export function ProfileAssistantClients(props: { relayPath: string }) {
  const t = useTranslations("profile.assistant");

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium">{t("connectTitle")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("connectDescription")}
        </p>
      </div>
      <ul className="flex flex-col divide-y">
        {ASSISTANT_CLIENTS.map((client) => (
          <ProfileAssistantClient
            key={client}
            client={client}
            relayPath={props.relayPath}
          />
        ))}
      </ul>
    </section>
  );
}
