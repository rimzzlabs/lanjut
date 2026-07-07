import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PlatformResumeGridError() {
  const t = useTranslations("platform.grid");

  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertTitle>{t("errorTitle")}</AlertTitle>
      <AlertDescription>{t("errorDescription")}</AlertDescription>
    </Alert>
  );
}
