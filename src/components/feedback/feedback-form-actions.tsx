"use client";

import { ExternalLink, SendIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const td = useTranslations("forms.direct");

  const submit = props.directEnabled ? (
    <Button type="submit" disabled={props.submitting}>
      {props.submitting ? <Spinner /> : <SendIcon />}
      {td("send")}
    </Button>
  ) : (
    <Button type="submit">
      <ExternalLink />
      {tc("openIssue")}
    </Button>
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
