import { WarningIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PlatformResumeGridError() {
  const t = useTranslations("platform.grid");

  return (
    <Alert variant="destructive">
      <WarningIcon />
      <AlertTitle>{t("errorTitle")}</AlertTitle>
      <AlertDescription>{t("errorDescription")}</AlertDescription>
    </Alert>
  );
}
