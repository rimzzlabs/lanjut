"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFeedbackKind } from "@/hooks/use-feedback-params";
import { TURNSTILE_SITE_KEY } from "../shared/turnstile";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { FeedbackBugReportForm } from "./feedback-bug-report-form";
import { FeedbackFeatureRequestForm } from "./feedback-feature-request-form";
import { FeedbackPanelSwitch } from "./feedback-panel-switch";

/**
 * The standalone feedback surface. The desktop app has no server of its own, so
 * it opens this page on the hosted site where Turnstile and /api/feedback work,
 * naming the kind, area, and client build in the query string.
 */
export function FeedbackPanel() {
  const [kind] = useFeedbackKind();
  const [sent, setSent] = useState(false);
  const t = useTranslations("feedback");
  const tk = useTranslations(kind === "bug" ? "forms.bug" : "forms.feature");

  if (sent) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-10">
        <Alert>
          <CheckCircle2 />
          <AlertTitle>{t("sentTitle")}</AlertTitle>
          <AlertDescription>{t("sentBody")}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => setSent(false)}
        >
          {t("sendAnother")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <FeedbackPanelSwitch />

      <div className="flex flex-col gap-1.5">
        <h1 className="font-semibold text-2xl tracking-tight">{tk("title")}</h1>
        <p className="text-balance text-muted-foreground text-sm">
          {tk(TURNSTILE_SITE_KEY ? "description" : "descriptionGitHubOnly")}
        </p>
      </div>

      {kind === "bug" ? (
        <FeedbackBugReportForm
          surface="page"
          onSubmitted={() => setSent(true)}
        />
      ) : (
        <FeedbackFeatureRequestForm
          surface="page"
          onSubmitted={() => setSent(true)}
        />
      )}
    </div>
  );
}
