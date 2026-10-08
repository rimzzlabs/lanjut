import { Alert, AlertDescription } from "@lanjut/ui/components/alert";
import { Button } from "@lanjut/ui/components/button";
import { InfoIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useOpenFeedback } from "@/hooks/use-open-feedback";

export function ResumeImportDisclaimer() {
  const t = useTranslations("forms.import");
  const openFeedback = useOpenFeedback();
  return (
    <Alert>
      <InfoIcon className="size-4 mt-px" />
      <AlertDescription className="text-xs">
        <span>
          {t("disclaimer")}{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 align-baseline text-xs"
            onClick={() => openFeedback({ kind: "bug", area: "import" })}
          >
            {t("reportIssue")}
          </Button>
        </span>
      </AlertDescription>
    </Alert>
  );
}
