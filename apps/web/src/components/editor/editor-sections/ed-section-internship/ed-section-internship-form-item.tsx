import { PROSE_FEATURES } from "@lanjut/resume/schema-registry";
import { Button } from "@lanjut/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@lanjut/ui/components/field";
import { Input } from "@lanjut/ui/components/input";
import { TrashIcon } from "@phosphor-icons/react";
import { type Control, Controller } from "react-hook-form";
import { useTranslations } from "use-intl";
import { UrlInput } from "@/components/shared/url-input";
import { RichTextField } from "../../rich-text/rich-text-field";
import { DateRangeFields } from "../date-range-fields";
import type { InternshipFormValues } from "../resume-form-adapter-jobs";

interface EditorSectionInternshipFormItemProps {
  index: number;
  control: Control<InternshipFormValues>;
  onRemoveField: (index: number) => void;
  onDatesCommit: () => void;
}

export function EditorSectionInternshipFormItem(
  props: EditorSectionInternshipFormItemProps,
) {
  const t = useTranslations("editor.internship");
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
          name={`internships.${props.index}.title`}
          render={(controller) => {
            const { field, fieldState } = controller;
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("role")}</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t("rolePlaceholder")}
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
            name={`internships.${props.index}.company`}
            render={(controller) => {
              const { field, fieldState } = controller;
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("company")}</FieldLabel>
                  <Input
                    placeholder={t("companyPlaceholder")}
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
            name={`internships.${props.index}.location`}
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

          <Controller
            control={props.control}
            name={`internships.${props.index}.companyContext`}
            render={(controller) => {
              const { field, fieldState } = controller;
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t("companyContext")}
                  </FieldLabel>
                  <Input
                    placeholder={t("companyContextPlaceholder")}
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
            name={`internships.${props.index}.website`}
            render={(controller) => {
              const { field, fieldState } = controller;
              return (
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
              );
            }}
          />
        </div>

        <DateRangeFields
          control={props.control}
          startName={`internships.${props.index}.startDate`}
          endName={`internships.${props.index}.endDate`}
          presentLabel={t("present")}
          onCommit={props.onDatesCommit}
        />

        <Controller
          control={props.control}
          name={`internships.${props.index}.description`}
          render={(controller) => {
            const { field, fieldState } = controller;
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("summary")}</FieldLabel>
                <RichTextField
                  id={field.name}
                  value={field.value}
                  features={PROSE_FEATURES}
                  placeholder={t("summaryPlaceholder")}
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
