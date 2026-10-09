import { FieldGroup } from "@lanjut/ui/components/field";
import type { ReactNode } from "react";
import { useWatch } from "react-hook-form";
import type {
  FeedbackControl,
  FeedbackFormValues,
} from "@/lib/feedback/feedback-form";
import type { FeedbackDetails } from "@/lib/feedback/feedback-schema";
import { FeedbackContactFields } from "./feedback-contact-fields";
import { FeedbackDetailsList } from "./feedback-details-list";
import { FeedbackReportPreview } from "./feedback-report-preview";

interface FeedbackReviewStepProps {
  control: FeedbackControl;
  details: FeedbackDetails;
  /**
   * Off when the reporter files the issue themselves on GitHub: it is theirs
   * already, so a name or username would add nothing.
   */
  showContact: boolean;
  includeDetails: boolean;
  onIncludeDetailsChange: (included: boolean) => void;
  /** The bot check, when direct sending is on. */
  verification: ReactNode;
}

/** Who sent it, what else goes with it, and the report as it will read. */
export function FeedbackReviewStep(props: FeedbackReviewStepProps) {
  const values = useWatch({ control: props.control }) as FeedbackFormValues;

  return (
    <FieldGroup>
      <FeedbackReportPreview values={values} />
      {props.showContact && <FeedbackContactFields control={props.control} />}
      <FeedbackDetailsList
        details={props.details}
        included={props.includeDetails}
        onIncludedChange={props.onIncludeDetailsChange}
      />
      {props.verification}
    </FieldGroup>
  );
}
