"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";
import { IS_DESKTOP } from "@/lib/build-target";
import { updateCheckIsDue, useUpdaterStore } from "@/lib/store";

/**
 * Offers an update, at most once every three days, and never installs on its
 * own. The check is a network call the user did not ask for, so a failure is
 * silent: someone who is offline, or behind a firewall, is not owed an error
 * about a version they never went looking for.
 */
export function DesktopUpdater() {
  const t = useTranslations("updater");

  useEffect(() => {
    if (!IS_DESKTOP) return;

    const now = Date.now();
    const { lastCheckedAt, dismissedVersion } = useUpdaterStore.getState();
    if (!updateCheckIsDue(lastCheckedAt, now)) return;

    let cancelled = false;

    void (async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check();
        if (cancelled) return;

        useUpdaterStore.getState().markChecked(Date.now());
        if (!update || update.version === dismissedVersion) return;

        toast(t("title", { version: update.version }), {
          description: t("description"),
          duration: Number.POSITIVE_INFINITY,
          action: {
            label: t("install"),
            onClick: () => void installUpdate(update, t("installing")),
          },
          cancel: {
            label: t("later"),
            onClick: () => useUpdaterStore.getState().dismiss(update.version),
          },
        });
      } catch {
        // Treated as "no update": see the note above.
        useUpdaterStore.getState().markChecked(Date.now());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [t]);

  return null;
}

async function installUpdate(
  update: { downloadAndInstall: () => Promise<void> },
  message: string,
) {
  toast.loading(message, { id: "updater-install" });
  await update.downloadAndInstall();
  const { relaunch } = await import("@tauri-apps/plugin-process");
  await relaunch();
}
