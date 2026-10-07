import {
  ArrowSquareOutIcon,
  PaperPlaneTiltIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import {
  ResponsiveDialogClose,
  ResponsiveDialogFooter,
} from "../shared/responsive-dialog";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import type { FeedbackSurface } from "./feedback-surface";

interface FeedbackFormActionsProps {
  surface: FeedbackSurface;
  directEnabled: boolean;
  submitting: boolean;
}

export function FeedbackFormActions(props: FeedbackFormActionsProps) {
  const tc = useTranslations("forms.common");

  const submit = (
    <FeedbackSubmitButton
      directEnabled={props.directEnabled}
      submitting={props.submitting}
    />
  );

  if (props.surface === "page") {
    return (
      <div className="mt-4 flex shrink-0 justify-end border-t pt-4">
        {submit}
      </div>
    );
  }

  return (
    <ResponsiveDialogFooter className="mt-4 border-t pt-4 md:shrink-0">
      <ResponsiveDialogClose type="button" variant="outline">
        <XIcon /> {tc("cancel")}
      </ResponsiveDialogClose>
      {submit}
    </ResponsiveDialogFooter>
  );
}

function FeedbackSubmitButton(props: {
  directEnabled: boolean;
  submitting: boolean;
}) {
  const tc = useTranslations("forms.common");
  const td = useTranslations("forms.direct");

  if (!props.directEnabled) {
    return (
      <Button type="submit">
        <ArrowSquareOutIcon />
        {tc("openIssue")}
      </Button>
    );
  }

  return (
    <Button type="submit" disabled={props.submitting}>
      {props.submitting ? <Spinner /> : <PaperPlaneTiltIcon />}
      {td("send")}
    </Button>
  );
}
