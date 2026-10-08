import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { emptyRichTextValue } from "@lanjut/resume";
import {
  richBlocksToMarkdown,
  richBlocksToText,
  tiptapToRichBlocks,
} from "@lanjut/resume/rich-content";
import { PROSE_FEATURES } from "@lanjut/resume/schema-registry";
import { Button } from "@lanjut/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@lanjut/ui/components/field";
import { Input } from "@lanjut/ui/components/input";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lanjut/ui/components/select";
import { A, O, S } from "@mobily/ts-belt";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { type FormEvent, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
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
import { RichTextEditor } from "../editor/rich-text/rich-text-editor";
import { TURNSTILE_SITE_KEY, Turnstile } from "../shared/turnstile";
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
    const summary = O.getWithDefault(A.head(richBlocksToText(problem)), "");

    const result = await submitFeedback({
      kind: "feature",
      name: values.name,
      client,
      turnstileToken: values.turnstileToken,
      summary: S.slice(summary, 0, 120),
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
    const summary = O.getWithDefault(A.head(richBlocksToText(problem)), "");
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
              render={(controller) => {
                const { field, fieldState } = controller;
                return (
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
                );
              }}
            />
          )}

          <Controller
            control={form.control}
            name="layer"
            render={(controller) => {
              const { field } = controller;
              return (
                <Field>
                  <FieldLabel htmlFor="feature-request-layer">
                    {t("layer")}
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger
                      id="feature-request-layer"
                      className="w-full"
                    >
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
              );
            }}
          />

          <Controller
            control={form.control}
            name="problem"
            render={(controller) => {
              const { field, fieldState } = controller;
              return (
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
              );
            }}
          />

          {directEnabled && (
            <Controller
              control={form.control}
              name="turnstileToken"
              render={(controller) => {
                const { field, fieldState } = controller;
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <Turnstile
                      key={turnstileEpoch}
                      onToken={(token) => field.onChange(token ?? "")}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                );
              }}
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
              <ArrowSquareOutIcon /> {td("githubAlt")}
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
