import { TrashIcon } from "@phosphor-icons/react";
import { type Control, Controller } from "react-hook-form";
import { useTranslations } from "use-intl";
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
import type { ProjectsFormValues } from "../resume-form-adapter-jobs";

interface EditorSectionProjectsFormItemProps {
  index: number;
  control: Control<ProjectsFormValues>;
  onRemoveField: (index: number) => void;
  onDatesCommit: () => void;
}

export function EditorSectionProjectsFormItem(
  props: EditorSectionProjectsFormItemProps,
) {
  const t = useTranslations("editor.projects");
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
          name={`projects.${props.index}.title`}
          render={(controller) => {
            const { field, fieldState } = controller;
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>{t("name")}</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t("namePlaceholder")}
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
            name={`projects.${props.index}.company`}
            render={(controller) => {
              const { field, fieldState } = controller;
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("role")}</FieldLabel>
                  <Input
                    placeholder={t("rolePlaceholder")}
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
            name={`projects.${props.index}.website`}
            render={(controller) => {
              const { field, fieldState } = controller;
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("url")}</FieldLabel>
                  <UrlInput
                    id={field.name}
                    value={field.value}
                    placeholder={t("urlPlaceholder")}
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
          startName={`projects.${props.index}.startDate`}
          endName={`projects.${props.index}.endDate`}
          presentLabel={t("present")}
          onCommit={props.onDatesCommit}
        />

        <Controller
          control={props.control}
          name={`projects.${props.index}.description`}
          render={(controller) => {
            const { field, fieldState } = controller;
            return (
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
            );
          }}
        />
      </FieldGroup>
    </FieldSet>
  );
}
