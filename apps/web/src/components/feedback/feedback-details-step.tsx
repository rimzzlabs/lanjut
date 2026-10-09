import type { FeedbackControl } from "@/lib/feedback/feedback-form";
import type { FeedbackKind } from "@/lib/feedback/feedback-schema";
import { FeedbackBugFields } from "./feedback-bug-fields";
import { FeedbackIdeaFields } from "./feedback-idea-fields";
import { FeedbackWordingFields } from "./feedback-wording-fields";

/** The fields of the chosen kind. */
export function FeedbackDetailsStep(props: {
  control: FeedbackControl;
  kind: FeedbackKind;
}) {
  if (props.kind === "idea")
    return <FeedbackIdeaFields control={props.control} />;
  if (props.kind === "wording") {
    return <FeedbackWordingFields control={props.control} />;
  }
  return <FeedbackBugFields control={props.control} />;
}
