import { TrashIcon } from "@phosphor-icons/react";
import { type Control, Controller } from "react-hook-form";
import { useTranslations } from "use-intl";
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
import { RichTextField } from "../../rich-text/rich-text-field";
import { DateRangeFields } from "../date-range-fields";
import type { EducationFormValues } from "../resume-form-adapter-jobs";

interface EditorSectionEducationFormItemProps {
  index: number;
  control: Control<EducationFormValues>;
  onRemoveField: (index: number) => void;
  onDatesCommit: () => void;
}

export function EditorSectionEducationFormItem(
  props: EditorSectionEducationFormItemProps,
) {
  const t = useTranslations("editor.education");
  const onRemove = () => {
    props.onRemoveField(props.index);
  };

  return (
    <FieldSet>
      <FieldLegend className="sr-only" variant="label">
        {t("itemLegend", { index: props.index + 1 })}
      </FieldLegend>
      <FieldGroup className="gap-3">
        <Controller
          control={props.control}
          name={`educations.${props.index}.institution`}
          render={(controller) => {
            const { field, fieldState } = controller;
            return (
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
                    <TrashIcon className="size-3.5 text-destructive" />
                    <span className="sr-only">{t("remove")}</span>
                  </Button>
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            );
          }}
        />

        <div className="grid gap-6 2xl:grid-cols-2 2xl:gap-3">
          <Controller
            control={props.control}
            name={`educations.${props.index}.degree`}
            render={(controller) => {
              const { field, fieldState } = controller;
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("degree")}</FieldLabel>
                  <Input
                    placeholder={t("degreePlaceholder")}
                    {...field}
                    id={field.name}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              );
            }}
          />

          <Controller
            control={props.control}
            name={`educations.${props.index}.location`}
            render={(controller) => {
              const { field, fieldState } = controller;
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("location")}</FieldLabel>
                  <Input
                    placeholder={t("locationPlaceholder")}
                    {...field}
                    id={field.name}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              );
            }}
          />
        </div>

        <DateRangeFields
          control={props.control}
          startName={`educations.${props.index}.startDate`}
          endName={`educations.${props.index}.endDate`}
          presentLabel={t("present")}
          onCommit={props.onDatesCommit}
        />

        <Controller
          control={props.control}
          name={`educations.${props.index}.details`}
          render={(controller) => {
            const { field, fieldState } = controller;
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("details")}</FieldLabel>
                <RichTextField
                  id={field.name}
                  value={field.value}
                  features={PROSE_FEATURES}
                  placeholder={t("detailsPlaceholder")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            );
          }}
        />
      </FieldGroup>
    </FieldSet>
  );
}
