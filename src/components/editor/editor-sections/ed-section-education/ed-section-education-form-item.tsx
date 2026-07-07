import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
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
import type { EducationFormValues } from "../resume-form-adapter";

interface EditorSectionEducationFormItemProps {
  index: number;
  control: Control<EducationFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionEducationFormItem(
  props: EditorSectionEducationFormItemProps,
) {
  const t = useTranslations("editor.education");
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
          name={`educations.${props.index}.institution`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("institution")}</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={t("institutionPlaceholder")}
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
            name={`educations.${props.index}.degree`}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("degree")}</FieldLabel>
                <Input
                  placeholder={t("degreePlaceholder")}
                  {...field}
                  id={field.name}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={props.control}
            name={`educations.${props.index}.location`}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("location")}</FieldLabel>
                <Input
                  placeholder={t("locationPlaceholder")}
                  {...field}
                  id={field.name}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <DateRangeFields
          control={props.control}
          startName={`educations.${props.index}.startDate`}
          endName={`educations.${props.index}.endDate`}
          presentLabel={t("present")}
        />

        <Controller
          control={props.control}
          name={`educations.${props.index}.details`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("details")}</FieldLabel>
              <RichTextEditor
                id={field.name}
                value={field.value}
                features={PROSE_FEATURES}
                placeholder={t("detailsPlaceholder")}
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
