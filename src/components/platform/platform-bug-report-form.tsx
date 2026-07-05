"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ExternalLink, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import {
  BUG_AREAS,
  type BugReportForm,
  bugReportSchema,
} from "@/lib/forms/bug-report";
import {
  areaForPathname,
  buildBugReportUrl,
  issueTitle,
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
import { Button } from "../ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PlatformBugReportFormProps {
  onSubmitted: () => void;
}

export function PlatformBugReportForm(props: PlatformBugReportFormProps) {
  const pathname = usePathname();
  const form = useForm<BugReportForm>({
    resolver: standardSchemaResolver(bugReportSchema),
    defaultValues: {
      whatHappened: emptyRichTextValue(),
      steps: emptyRichTextValue(),
      area: areaForPathname(pathname),
    },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit((values) => {
    const whatHappened = tiptapToRichBlocks(values.whatHappened);
    const steps = tiptapToRichBlocks(values.steps);
    const url = buildBugReportUrl({
      title: issueTitle(
        "fix(bug,via app):",
        richBlocksToText(whatHappened)[0] ?? "",
      ),
      whatHappened: richBlocksToMarkdown(whatHappened),
      steps: richBlocksToMarkdown(steps),
      area: values.area,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    props.onSubmitted();
  });

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="whatHappened"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="bug-report-what-happened">
                What happened?
              </FieldLabel>
              <RichTextEditor
                id="bug-report-what-happened"
                features={PROSE_FEATURES}
                placeholder="The editor preview goes blank when..."
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="steps"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="bug-report-steps">
                Steps to reproduce
              </FieldLabel>
              <RichTextEditor
                id="bug-report-steps"
                features={PROSE_FEATURES}
                placeholder="1. Create a résumé (a numbered list works great here)"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
              <FieldDescription>
                Optional here; you can also fill this in on GitHub.
              </FieldDescription>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="area"
          render={({ field }) => (
            <Field>
              <FieldLabel>Where does the bug show up?</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Area" />
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
      </FieldGroup>

      <ResponsiveDialogFooter className="mt-6">
        <ResponsiveDialogClose type="button" variant="outline">
          <XIcon /> Cancel
        </ResponsiveDialogClose>
        <Button type="submit">
          <ExternalLink />
          Open GitHub issue
        </Button>
      </ResponsiveDialogFooter>
    </form>
  );
}
