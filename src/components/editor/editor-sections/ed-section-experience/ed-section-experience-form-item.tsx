import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
import { UrlInput } from "@/components/shared/url-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PROSE_FEATURES } from "@/lib/resume/schema-registry";
import { RichTextEditor } from "../../rich-text/rich-text-editor";
import { DateRangeFields } from "../date-range-fields";
import type { ExperienceFormValues } from "../resume-form-adapter";

interface EditorSectionExperienceFormItemProps {
  index: number;
  control: Control<ExperienceFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionExperienceFormItem(
  props: EditorSectionExperienceFormItemProps,
) {
  const t = useTranslations("editor.experience");
  const onRemove = () => {
    props.onRemoveField(props.index);
  };

  return (
    <FieldSet className="not-last-of-type:pb-4 not-last-of-type:border-b">
      <FieldLegend className="sr-only" variant="label">
        {t("itemLegend", { index: props.index + 1 })}
      </FieldLegend>

      <FieldGroup className="gap-3">
        <Controller
          control={props.control}
          name={`experiences.${props.index}.title`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("jobTitle")}</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={t("jobTitlePlaceholder")}
                  {...field}
                  id={field.name}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={onRemove}
                >
                  <Trash className="size-3.5 stroke-destructive" />
                  <span className="sr-only">{t("remove")}</span>
                </Button>
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="grid gap-6 2xl:grid-cols-2 2xl:gap-3">
          <Controller
            control={props.control}
            name={`experiences.${props.index}.company`}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("company")}</FieldLabel>
                <Input
                  placeholder={t("companyPlaceholder")}
                  {...field}
                  id={field.name}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={props.control}
            name={`experiences.${props.index}.website`}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t("companyWebsite")}
                </FieldLabel>
                <UrlInput
                  id={field.name}
                  value={field.value}
                  placeholder={t("companyWebsitePlaceholder")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <DateRangeFields
          control={props.control}
          startName={`experiences.${props.index}.startDate`}
          endName={`experiences.${props.index}.endDate`}
          presentLabel={t("present")}
        />

        <Controller
          control={props.control}
          name={`experiences.${props.index}.description`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("summary")}</FieldLabel>
              <RichTextEditor
                id={field.name}
                value={field.value}
                features={PROSE_FEATURES}
                placeholder={t("summaryPlaceholder")}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
}
