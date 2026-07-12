"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useIssueReportStore } from "@/lib/store";

export function ResumeImportDisclaimer() {
  const t = useTranslations("forms.import");
  const openIssueReport = useIssueReportStore((state) => state.setOpen);
  return (
    <Alert>
      <Info className="size-4 mt-px" />
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
