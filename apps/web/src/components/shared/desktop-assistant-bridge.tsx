import type { Resume } from "@lanjut/resume";
import { useEffect, useEffectEvent } from "react";
import { useTranslations } from "use-intl";
import { useRouter } from "@/i18n/navigation";
import { attachAssistantBridge } from "@/lib/assistant/assistant-bridge";
import { showAssistantNotice } from "@/lib/assistant/assistant-notice";
import { IS_DESKTOP } from "@/lib/build-target";
import { markAssistantChange } from "@/lib/store/assistant-activity-store";
import { watchAssistantStatus } from "@/lib/store/assistant-store";
import { AssistantDeleteRequest } from "./assistant-delete-request";

/**
 * Connects the page to the desktop app's MCP server, and follows the switch
 * and the connections. It sits inside the app's router, so a tool call can
 * show a résumé in the editor.
 */
export function DesktopAssistantBridge() {
  const t = useTranslations("platform.assistant");
  const router = useRouter();

  const go = useEffectEvent((href: string) => router.push(href));
  const changed = useEffectEvent((before: Resume, written: Resume) => {
    // The editor shows the résumé by now, so its preview code is loaded.
    void import("@/components/editor/resume-block-changes").then((module) =>
      markAssistantChange(written.id, module.changedBlockIds(before, written)),
    );
    showAssistantNotice(written, {
      changed: t("changed", { title: written.title }),
      undo: t("undo"),
    });
  });

  useEffect(() => {
    if (!IS_DESKTOP) return;
    const controller = new AbortController();
    // A window that cannot attach still works: the server tells the assistant
    // that the window is not ready.
    void attachAssistantBridge(controller.signal, { go, changed }).catch(
      () => undefined,
    );
    void watchAssistantStatus(controller.signal).catch(() => undefined);
    return () => controller.abort();
  }, []);

  if (!IS_DESKTOP) return null;
  return <AssistantDeleteRequest />;
}
