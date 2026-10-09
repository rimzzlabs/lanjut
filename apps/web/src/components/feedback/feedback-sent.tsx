import { Button, buttonVariants } from "@lanjut/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@lanjut/ui/components/empty";
import { cn } from "@lanjut/ui/lib/utils";
import { ArrowUpRightIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { ExternalLink } from "../shared/external-link";

interface FeedbackSentProps {
  /** The filed issue, or null when the reporter finishes it on GitHub. */
  issueUrl: string | null;
  onSendAnother: () => void;
  onClose: (() => void) | undefined;
}

/**
 * After sending: where the issue is, and what the reporter can still do
 * there (follow it, add a screenshot), since the form cannot attach files.
 */
export function FeedbackSent(props: FeedbackSentProps) {
  const t = useTranslations("feedback");
  const filed = props.issueUrl !== null;

  return (
    <Empty className="py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckCircleIcon />
        </EmptyMedia>
        <EmptyTitle>{t(filed ? "sentTitle" : "githubTitle")}</EmptyTitle>
        <EmptyDescription>
          {t(filed ? "sentBody" : "githubBody")}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center">
        {props.issueUrl !== null && (
          <ExternalLink href={props.issueUrl} className={buttonVariants()}>
            {t("viewIssue")}
            <ArrowUpRightIcon data-icon="inline-end" />
          </ExternalLink>
        )}
        <Button variant="outline" onClick={props.onSendAnother}>
          {t("sendAnother")}
        </Button>
        {props.onClose && (
          <Button
            variant="ghost"
            className={cn("max-sm:w-full")}
            onClick={props.onClose}
          >
            {t("close")}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
