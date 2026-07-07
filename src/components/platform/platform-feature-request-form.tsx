"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ExternalLink, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import {
  createFeatureRequestSchema,
  FEATURE_LAYERS,
  type FeatureRequestForm,
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
  const t = useTranslations("forms.feature");
  const tc = useTranslations("forms.common");
  const tv = useValidationTranslator();
  const schema = useMemo(() => createFeatureRequestSchema(tv), [tv]);
  const form = useForm<FeatureRequestForm>({
    resolver: standardSchemaResolver(schema),
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

        <Controller
          control={form.control}
          name="proposal"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="feature-request-proposal">
                {t("proposal")}
              </FieldLabel>
              <RichTextEditor
                id="feature-request-proposal"
                features={PROSE_FEATURES}
                placeholder={t("proposalPlaceholder")}
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
      </FieldGroup>

      <ResponsiveDialogFooter className="mt-6">
        <ResponsiveDialogClose type="button" variant="outline">
          <XIcon /> {tc("cancel")}
        </ResponsiveDialogClose>
        <Button type="submit">
          <ExternalLink />
          {tc("openIssue")}
        </Button>
      </ResponsiveDialogFooter>
    </form>
  );
}
