import {
  DB_BLOCKED,
  DB_EVENTS,
  DB_OUTDATED,
  DB_READY,
} from "@lanjut/resume/db";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";

const BLOCKED_TOAST = "database-blocked";
const OUTDATED_TOAST = "database-outdated";

/**
 * Tells the person when another tab holds up the database. While a tab on an
 * older build blocks this one's upgrade, a notice asks them to close it, and
 * it goes away by itself once the database opens. When a newer build in
 * another tab takes over, this tab has let the database go, so it asks for a
 * refresh. Listening to the persistence layer is an external-system effect.
 */
export function PlatformDatabaseNotice() {
  const t = useTranslations("platform.database");

  useEffect(() => {
    function onBlocked() {
      toast.warning(t("blocked"), {
        id: BLOCKED_TOAST,
        description: t("blockedDescription"),
        duration: Number.POSITIVE_INFINITY,
      });
    }
    function onReady() {
      toast.dismiss(BLOCKED_TOAST);
    }
    function onOutdated() {
      toast.warning(t("outdated"), {
        id: OUTDATED_TOAST,
        description: t("outdatedDescription"),
        duration: Number.POSITIVE_INFINITY,
        action: {
          label: t("refresh"),
          onClick: () => window.location.reload(),
        },
      });
    }

    DB_EVENTS.addEventListener(DB_BLOCKED, onBlocked);
    DB_EVENTS.addEventListener(DB_READY, onReady);
    DB_EVENTS.addEventListener(DB_OUTDATED, onOutdated);
    return () => {
      DB_EVENTS.removeEventListener(DB_BLOCKED, onBlocked);
      DB_EVENTS.removeEventListener(DB_READY, onReady);
      DB_EVENTS.removeEventListener(DB_OUTDATED, onOutdated);
    };
  }, [t]);

  return null;
}
