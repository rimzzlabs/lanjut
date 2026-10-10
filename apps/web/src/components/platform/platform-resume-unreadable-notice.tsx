import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@lanjut/ui/components/alert";
import { WarningIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useOnline } from "@/hooks/use-online";
import { useResumeStore } from "@/lib/store";

export function PlatformResumeUnreadableNotice() {
  const unreadableCount = useResumeStore((state) => state.unreadableCount);
  const t = useTranslations("platform.unreadable");
  const online = useOnline();

  if (unreadableCount === 0) return null;

  return (
    <Alert>
      <WarningIcon />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription>
        {t("description", { count: unreadableCount })}{" "}
        {online ? t("refresh") : t("refreshOffline")}
      </AlertDescription>
    </Alert>
  );
}
