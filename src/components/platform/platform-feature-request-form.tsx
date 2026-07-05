"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ExternalLink, XIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  FEATURE_LAYERS,
  type FeatureRequestForm,
  featureRequestSchema,
} from "@/lib/forms/feature-request";
import { buildFeatureRequestUrl, issueTitle } from "@/lib/github-issue";
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

interface PlatformFeatureRequestFormProps {
  onSubmitted: () => void;
}

export function PlatformFeatureRequestForm(
  props: PlatformFeatureRequestFormProps,
) {
  const form = useForm<FeatureRequestForm>({
    resolver: standardSchemaResolver(featureRequestSchema),
    defaultValues: {
      problem: emptyRichTextValue(),
      proposal: emptyRichTextValue(),
      layer: "Other / not sure",
    },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit((values) => {
    const problem = tiptapToRichBlocks(values.problem);
    const proposal = tiptapToRichBlocks(values.proposal);
    const url = buildFeatureRequestUrl({
      title: issueTitle("feat(via app):", richBlocksToText(proposal)[0] ?? ""),
      problem: richBlocksToMarkdown(problem),
      proposal: richBlocksToMarkdown(proposal),
      layer: values.layer,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    props.onSubmitted();
  });

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="problem"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="feature-request-problem">
                What problem does this solve?
              </FieldLabel>
              <RichTextEditor
                id="feature-request-problem"
                features={PROSE_FEATURES}
                placeholder="When I tailor my résumé for different roles, I have to..."
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
              <FieldDescription>
                Describe the situation where you needed this, rather than the
                solution itself.
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="proposal"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="feature-request-proposal">
                Proposed solution
              </FieldLabel>
              <RichTextEditor
                id="feature-request-proposal"
                features={PROSE_FEATURES}
                placeholder="How do you imagine it working?"
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
          name="layer"
          render={({ field }) => (
            <Field>
              <FieldLabel>Which layer does this touch?</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Layer" />
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
