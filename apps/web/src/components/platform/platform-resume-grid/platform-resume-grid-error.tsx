import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@lanjut/ui/components/alert";
import { WarningIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

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
