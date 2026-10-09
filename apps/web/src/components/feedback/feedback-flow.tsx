import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Field, FieldError } from "@lanjut/ui/components/field";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import { cn } from "@lanjut/ui/lib/utils";
import {
  type FormEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { type Resolver, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useLocale, useTranslations } from "use-intl";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import {
  createFeedbackFormSchema,
  DETAIL_FIELDS,
  defaultFeedbackValues,
  type FeedbackAccount,
  type FeedbackFormReport,
  type FeedbackFormValues,
  toFeedbackReport,
} from "@/lib/feedback/feedback-form";
import {
  buildFeedbackIssue,
  type FeedbackDelivery,
} from "@/lib/feedback/feedback-issue";
import type {
  FeedbackArea,
  FeedbackDetails,
  FeedbackKind,
  WordingLanguage,
} from "@/lib/feedback/feedback-schema";
import { buildFallbackIssueUrl, submitFeedback } from "@/lib/github-issue";
import { openExternal } from "@/lib/open-external";
import { TURNSTILE_SITE_KEY, Turnstile } from "../shared/turnstile";
import { FeedbackDetailsStep } from "./feedback-details-step";
import { FeedbackFooter } from "./feedback-footer";
import { FeedbackKindStep } from "./feedback-kind-step";
import { FeedbackReviewStep } from "./feedback-review-step";
import { FeedbackSent } from "./feedback-sent";
import { FeedbackStepper } from "./feedback-stepper";
import { type FeedbackStep, NEXT_STEP, PREVIOUS_STEP } from "./feedback-steps";

/** Where the flow is mounted: a sheet in the app, or the /feedback page. */
export type FeedbackSurface = "sheet" | "page";

const LAYOUT: Record<FeedbackSurface, { form: string; header: string }> = {
  sheet: {
    form: "grid h-full min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto]",
    header: "border-b p-4 pr-14 sm:p-6 sm:pr-14",
  },
  page: { form: "flex flex-col gap-8", header: "" },
};

const STEP_TITLE_KEYS: Record<FeedbackStep, string> = {
  kind: "kindLabel",
  details: "detailsTitle",
  review: "reviewTitle",
};

/**
 * Lanjut posts a report only for a reporter without a GitHub account, and
 * only when direct sending is on; every other report opens prefilled on
 * GitHub for the reporter to post.
 */
function deliveryFor(
  directEnabled: boolean,
  account: FeedbackAccount,
): FeedbackDelivery {
  if (directEnabled && account === "none") return "relay";
  return "github";
}

interface FeedbackFlowProps {
  surface: FeedbackSurface;
  /** Skips the kind step when the opener already named it. */
  kind: FeedbackKind | undefined;
  area: FeedbackArea;
  details: FeedbackDetails;
  /** Closes the sheet. Absent on the page. */
  onClose?: () => void;
}

/**
 * Sending feedback in three steps: what kind it is, the details that kind
 * needs, then a review of what becomes public with who sent it and the
 * technical details. It files the GitHub issue through the Worker, or, with
 * direct sending off, opens the same issue prefilled on GitHub.
 */
export function FeedbackFlow(props: FeedbackFlowProps) {
  const t = useTranslations("feedback");
  const locale = useLocale() as WordingLanguage;
  const tv = useValidationTranslator();
  const schema = useMemo(() => createFeedbackFormSchema(tv), [tv]);
  const firstStep: FeedbackStep = props.kind ? "details" : "kind";
  const defaults = defaultFeedbackValues(
    props.kind ?? "bug",
    props.area,
    locale,
  );
  const form = useForm<FeedbackFormValues, unknown, FeedbackFormReport>({
    // The form keeps every kind's fields; the schema reads the chosen kind's.
    resolver: standardSchemaResolver(schema) as unknown as Resolver<
      FeedbackFormValues,
      unknown,
      FeedbackFormReport
    >,
    defaultValues: defaults,
    // A field checks itself as it changes, so an error clears while the
    // reporter fixes it, not only on the next click.
    mode: "onChange",
  });
  const kind = useWatch({ control: form.control, name: "kind" });
  const account = useWatch({ control: form.control, name: "account" });
  const [step, setStep] = useState<FeedbackStep>(firstStep);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [token, setToken] = useState("");
  const [tokenEpoch, setTokenEpoch] = useState(0);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [sent, setSent] = useState<{ url: string | null } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const directEnabled = Boolean(TURNSTILE_SITE_KEY);
  const delivery = deliveryFor(directEnabled, account);
  const layout = LAYOUT[props.surface];

  // Focus follows the step, so a screen reader announces it and the
  // keyboard lands where the work is.
  function goToStep(next: FeedbackStep) {
    flushSync(() => setStep(next));
    headingRef.current?.focus();
  }

  async function goForward() {
    if (step === "kind") {
      goToStep(NEXT_STEP[step]);
      return;
    }
    const valid = await form.trigger([...DETAIL_FIELDS[kind]], {
      shouldFocus: true,
    });
    if (valid) goToStep(NEXT_STEP[step]);
  }

  function resetToken() {
    setToken("");
    setTokenEpoch((epoch) => epoch + 1);
  }

  const send = form.handleSubmit(async (formReport) => {
    const report = toFeedbackReport(formReport);
    const details = includeDetails ? props.details : undefined;
    if (delivery === "github") {
      void openExternal(
        buildFallbackIssueUrl(buildFeedbackIssue(report, details, "github")),
      );
      setSent({ url: null });
      return;
    }
    if (!token) {
      setTokenMissing(true);
      return;
    }
    const result = await submitFeedback({
      report,
      details,
      turnstileToken: token,
    });
    // Turnstile tokens are single-use; remount the widget for a fresh one.
    resetToken();
    if (!result.ok) {
      toast.error(t("errorToast"));
      return;
    }
    setSent({ url: result.url ?? null });
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (step === "review") {
      void send(event);
      return;
    }
    event.preventDefault();
    void goForward();
  }

  function sendAnother() {
    form.reset({
      ...defaults,
      kind: form.getValues("kind"),
      account: form.getValues("account"),
    });
    setSent(null);
    setStep("kind");
  }

  if (sent) {
    return (
      <FeedbackSent
        issueUrl={sent.url}
        onSendAnother={sendAnother}
        onClose={props.onClose}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={layout.form}>
      <header className={cn("flex flex-col gap-4", layout.header)}>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">{t("title")}</h2>
          <p className="text-sm text-balance text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <FeedbackStepper current={step} onStepChange={goToStep} />
      </header>

      <FeedbackBody surface={props.surface}>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="mb-5 text-base font-medium outline-none"
        >
          {t(STEP_TITLE_KEYS[step], { kind: t(`kinds.${kind}.title`) })}
        </h3>
        {step === "kind" && (
          <FeedbackKindStep control={form.control} askAccount={directEnabled} />
        )}
        {step === "details" && (
          <FeedbackDetailsStep control={form.control} kind={kind} />
        )}
        {step === "review" && (
          <FeedbackReviewStep
            control={form.control}
            details={props.details}
            showContact={delivery === "relay"}
            includeDetails={includeDetails}
            onIncludeDetailsChange={setIncludeDetails}
            verification={
              delivery === "relay" && (
                <Field data-invalid={tokenMissing || undefined}>
                  <Turnstile
                    key={tokenEpoch}
                    onToken={(next) => {
                      setToken(next ?? "");
                      if (next) setTokenMissing(false);
                    }}
                  />
                  {tokenMissing && (
                    <FieldError>{tv("verificationRequired")}</FieldError>
                  )}
                </Field>
              )
            }
          />
        )}
      </FeedbackBody>

      <div className={cn(props.surface === "sheet" && "border-t p-4 sm:px-6")}>
        <FeedbackFooter
          step={step}
          delivery={delivery}
          submitting={form.formState.isSubmitting}
          onCancel={props.onClose}
          onBack={() => goToStep(PREVIOUS_STEP[step])}
        />
      </div>
    </form>
  );
}

/** In the sheet the steps scroll between the fixed header and footer. */
function FeedbackBody(props: {
  surface: FeedbackSurface;
  children: ReactNode;
}) {
  if (props.surface === "page") return <div>{props.children}</div>;
  return (
    <ScrollArea className="min-h-0">
      <div className="p-4 sm:p-6">{props.children}</div>
    </ScrollArea>
  );
}
