"use client";

import { useTranslations } from "next-intl";
import { useFeedbackKind } from "@/hooks/use-feedback-params";
import { SegmentedControl } from "../shared/segmented-control";

/** Chooses between the bug report and the feature request on the page surface. */
export function FeedbackPanelSwitch() {
  const [kind, setKind] = useFeedbackKind();
  const t = useTranslations("feedback");
  const tb = useTranslations("forms.bug");
  const tf = useTranslations("forms.feature");

  return (
    <SegmentedControl
      aria-label={t("kindLabel")}
      value={kind}
      onValueChange={(next) => void setKind(next === "feature" ? next : "bug")}
      items={[
        { value: "bug", label: tb("title") },
        { value: "feature", label: tf("title") },
      ]}
    />
  );
}
