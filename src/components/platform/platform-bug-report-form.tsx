"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ExternalLink, SendIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { emptyRichTextValue } from "@/lib/resume";
import { PROSE_FEATURES } from "@/lib/resume/schema-registry";
import {
  richBlocksToMarkdown,
  richBlocksToText,
  tiptapToRichBlocks,
} from "../editor/rich-content";
import { RichTextEditor } from "../editor/rich-text/rich-text-editor";
import {
  ResponsiveDialogClose,
  ResponsiveDialogFooter,
} from "../shared/responsive-dialog";
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
import { Spinner } from "../ui/spinner";

interface PlatformBugReportFormProps {
  onSubmitted: () => void;
}

export function PlatformBugReportForm(props: PlatformBugReportFormProps) {
  const pathname = usePathname();
  const t = useTranslations("forms.bug");
  const tc = useTranslations("forms.common");
  const td = useTranslations("forms.direct");
  const tv = useValidationTranslator();
  const schema = useMemo(() => createBugReportSchema(tv), [tv]);
  const [turnstileEpoch, setTurnstileEpoch] = useState(0);
  const directEnabled = Boolean(TURNSTILE_SITE_KEY);
  const form = useForm<BugReportForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      name: "",
      area: areaForPathname(pathname),
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
    window.open(url, "_blank", "noopener,noreferrer");
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
    <form
      onSubmit={handleSubmit}
      className="md:grid md:min-h-0 md:flex-1 md:grid-rows-[minmax(0,1fr)_auto]"
    >
      <ScrollArea className="md:-mr-2 md:min-h-0 md:pr-2">
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
              className="h-auto self-start p-0"
              disabled={form.formState.isSubmitting}
              onClick={openGitHubIssue}
            >
              <ExternalLink /> {td("githubAlt")}
            </Button>
          )}
        </FieldGroup>
      </ScrollArea>

      <ResponsiveDialogFooter className="mt-4 border-t pt-4 md:shrink-0">
        <ResponsiveDialogClose type="button" variant="outline">
          <XIcon /> {tc("cancel")}
        </ResponsiveDialogClose>
        {directEnabled ? (
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Spinner /> : <SendIcon />}
            {td("send")}
          </Button>
        ) : (
          <Button type="submit">
            <ExternalLink />
            {tc("openIssue")}
          </Button>
        )}
      </ResponsiveDialogFooter>
    </form>
  );
}
