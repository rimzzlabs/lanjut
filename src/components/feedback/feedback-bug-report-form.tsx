"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useFeedbackArea,
  useFeedbackClient,
} from "@/hooks/use-feedback-params";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import { usePathname } from "@/i18n/navigation";
import {
  BUG_AREAS,
  type BugReportForm,
  createBugReportSchema,
} from "@/lib/forms/bug-report";
import {
  areaForPathname,
  buildBugReportUrl,
  issueTitle,
  submitFeedback,
} from "@/lib/github-issue";
import { openExternal } from "@/lib/open-external";
import { emptyRichTextValue } from "@/lib/resume";
import {
  richBlocksToMarkdown,
  richBlocksToText,
  tiptapToRichBlocks,
} from "@/lib/resume/rich-content";
import { PROSE_FEATURES } from "@/lib/resume/schema-registry";
import { RichTextEditor } from "../editor/rich-text/rich-text-editor";
import { TURNSTILE_SITE_KEY, Turnstile } from "../shared/turnstile";
import { Button } from "../ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FeedbackFormActions } from "./feedback-form-actions";
import {
  FEEDBACK_SURFACE_CLASS,
  type FeedbackSurface,
} from "./feedback-surface";

interface FeedbackBugReportFormProps {
  surface: FeedbackSurface;
  onSubmitted: () => void;
}

export function FeedbackBugReportForm(props: FeedbackBugReportFormProps) {
  const pathname = usePathname();
  const prefilledArea = useFeedbackArea();
  const client = useFeedbackClient();
  const t = useTranslations("forms.bug");
  const td = useTranslations("forms.direct");
  const tv = useValidationTranslator();
  const schema = useMemo(() => createBugReportSchema(tv), [tv]);
  const [turnstileEpoch, setTurnstileEpoch] = useState(0);
  const directEnabled = Boolean(TURNSTILE_SITE_KEY);
  const surfaceClass = FEEDBACK_SURFACE_CLASS[props.surface];
  const form = useForm<BugReportForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      name: "",
      area: prefilledArea ?? areaForPathname(pathname),
      whatHappened: emptyRichTextValue(),
      turnstileToken: "",
    },
    mode: "onChange",
  });

  const submitDirect = form.handleSubmit(async (values) => {
    const whatHappened = tiptapToRichBlocks(values.whatHappened);
    const summary = richBlocksToText(whatHappened)[0] ?? "";

    const result = await submitFeedback({
      kind: "bug",
      name: values.name,
      client,
      turnstileToken: values.turnstileToken,
      summary: summary.slice(0, 120),
      whatHappened: richBlocksToMarkdown(whatHappened),
      area: values.area,
    });
    if (!result.ok) {
      // Turnstile tokens are single-use; remount the widget for a fresh one.
      form.setValue("turnstileToken", "");
      setTurnstileEpoch((epoch) => epoch + 1);
      toast.error(td("errorToast"));
      return;
    }
    toast.success(td("sentToast"));
    props.onSubmitted();
  });

  // Unvalidated: GitHub's issue template enforces its own required fields.
  function openGitHubIssue() {
    const values = form.getValues();
    const whatHappened = tiptapToRichBlocks(values.whatHappened);
    const summary = richBlocksToText(whatHappened)[0] ?? "";
    const url = buildBugReportUrl({
      title: summary ? issueTitle("fix(bug,via app):", summary) : "",
      whatHappened: richBlocksToMarkdown(whatHappened),
      area: values.area,
    });
    void openExternal(url);
    props.onSubmitted();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (directEnabled) {
      void submitDirect(event);
      return;
    }
    event.preventDefault();
    openGitHubIssue();
  }

  return (
    <form onSubmit={handleSubmit} className={surfaceClass.form}>
      <ScrollArea className={surfaceClass.fields}>
        <FieldGroup className="px-1 py-2">
          {directEnabled && (
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bug-report-name">
                    {td("name")}
                  </FieldLabel>
                  <Input
                    id="bug-report-name"
                    placeholder={td("namePlaceholder")}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  <FieldDescription>{td("nameDescription")}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          )}

          <Controller
            control={form.control}
            name="area"
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("area")}</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("areaPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent
                    alignItemWithTrigger={false}
                    align="start"
                    className="w-[--anchor-width]"
                  >
                    <SelectGroup>
                      {BUG_AREAS.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="whatHappened"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="bug-report-what-happened">
                  {t("whatHappened")}
                </FieldLabel>
                <RichTextEditor
                  id="bug-report-what-happened"
                  features={PROSE_FEATURES}
                  placeholder={t("whatHappenedPlaceholder")}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
                <FieldDescription>
                  {t("whatHappenedDescription")}
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {directEnabled && (
            <Controller
              control={form.control}
              name="turnstileToken"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Turnstile
                    key={turnstileEpoch}
                    onToken={(token) => field.onChange(token ?? "")}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          )}

          {directEnabled && (
            <Button
              type="button"
              variant="link"
              className="h-auto items-start self-start whitespace-normal p-0 text-left"
              disabled={form.formState.isSubmitting}
              onClick={openGitHubIssue}
            >
              <ExternalLink /> {td("githubAlt")}
            </Button>
          )}
        </FieldGroup>
      </ScrollArea>

      <FeedbackFormActions
        surface={props.surface}
        directEnabled={directEnabled}
        submitting={form.formState.isSubmitting}
      />
    </form>
  );
}
