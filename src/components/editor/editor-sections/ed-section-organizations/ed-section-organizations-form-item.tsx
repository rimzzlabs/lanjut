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
import type { OrganizationsFormValues } from "../resume-form-adapter";

interface EditorSectionOrganizationsFormItemProps {
  index: number;
  control: Control<OrganizationsFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionOrganizationsFormItem(
  props: EditorSectionOrganizationsFormItemProps,
) {
  const t = useTranslations("editor.organizations");
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
          name={`organizations.${props.index}.role`}
          render={({ field, fieldState }) => (
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
                  <Trash className="size-3.5 stroke-destructive" />
                  <span className="sr-only">{t("remove")}</span>
                </Button>
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={props.control}
          name={`organizations.${props.index}.organization`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("organization")}</FieldLabel>
              <Input
                placeholder={t("organizationPlaceholder")}
                {...field}
                id={field.name}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <DateRangeFields
          control={props.control}
          startName={`organizations.${props.index}.startDate`}
          endName={`organizations.${props.index}.endDate`}
          presentLabel={t("present")}
        />

        <Controller
          control={props.control}
          name={`organizations.${props.index}.description`}
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
