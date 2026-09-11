"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useFeedbackClient } from "@/hooks/use-feedback-params";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import {
  createFeatureRequestSchema,
  FEATURE_LAYERS,
  type FeatureRequestForm,
} from "@/lib/forms/feature-request";
import {
  buildFeatureRequestUrl,
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

interface FeedbackFeatureRequestFormProps {
  surface: FeedbackSurface;
  onSubmitted: () => void;
}

export function FeedbackFeatureRequestForm(
  props: FeedbackFeatureRequestFormProps,
) {
  const t = useTranslations("forms.feature");
  const td = useTranslations("forms.direct");
  const client = useFeedbackClient();
  const tv = useValidationTranslator();
  const schema = useMemo(() => createFeatureRequestSchema(tv), [tv]);
  const [turnstileEpoch, setTurnstileEpoch] = useState(0);
  const directEnabled = Boolean(TURNSTILE_SITE_KEY);
  const surfaceClass = FEEDBACK_SURFACE_CLASS[props.surface];
  const form = useForm<FeatureRequestForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      name: "",
      layer: "Other / not sure",
      problem: emptyRichTextValue(),
      turnstileToken: "",
    },
    mode: "onChange",
  });

  const submitDirect = form.handleSubmit(async (values) => {
    const problem = tiptapToRichBlocks(values.problem);
    const summary = richBlocksToText(problem)[0] ?? "";

    const result = await submitFeedback({
      kind: "feature",
      name: values.name,
      client,
      turnstileToken: values.turnstileToken,
      summary: summary.slice(0, 120),
      problem: richBlocksToMarkdown(problem),
      layer: values.layer,
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
    const problem = tiptapToRichBlocks(values.problem);
    const summary = richBlocksToText(problem)[0] ?? "";
    const url = buildFeatureRequestUrl({
      title: summary ? issueTitle("feat(via app):", summary) : "",
      problem: richBlocksToMarkdown(problem),
      layer: values.layer,
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
                  <FieldLabel htmlFor="feature-request-name">
                    {td("name")}
                  </FieldLabel>
                  <Input
                    id="feature-request-name"
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
            name="layer"
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("layer")}</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("layerPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent
                    alignItemWithTrigger={false}
                    align="start"
                    className="w-[--anchor-width]"
                  >
                    <SelectGroup>
                      {FEATURE_LAYERS.map((layer) => (
                        <SelectItem key={layer} value={layer}>
                          {layer}
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
            name="problem"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="feature-request-problem">
                  {t("problem")}
                </FieldLabel>
                <RichTextEditor
                  id="feature-request-problem"
                  features={PROSE_FEATURES}
                  placeholder={t("problemPlaceholder")}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
                <FieldDescription>{t("problemDescription")}</FieldDescription>
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
