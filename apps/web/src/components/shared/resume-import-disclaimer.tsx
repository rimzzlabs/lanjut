import { Alert, AlertDescription } from "@lanjut/ui/components/alert";
import { Button } from "@lanjut/ui/components/button";
import { InfoIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useIssueReportStore } from "@/lib/store";

export function ResumeImportDisclaimer() {
  const t = useTranslations("forms.import");
  const openIssueReport = useIssueReportStore((state) => state.setOpen);
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
            onClick={() => openIssueReport("bug")}
          >
            {t("reportIssue")}
          </Button>
        </span>
      </AlertDescription>
    </Alert>
  );
}
