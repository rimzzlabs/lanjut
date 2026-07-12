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
import type { CustomListFormValues } from "../resume-form-adapter";

interface EditorSectionCustomListItemProps {
  index: number;
  control: Control<CustomListFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionCustomListItem(
  props: EditorSectionCustomListItemProps,
) {
  const t = useTranslations("editor.custom");
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
          name={`entries.${props.index}.title`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("entryTitle")}</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={t("entryTitlePlaceholder")}
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
                  <span className="sr-only">{t("removeEntry")}</span>
                </Button>
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={props.control}
          name={`entries.${props.index}.subtitle`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("entrySubtitle")}</FieldLabel>
              <Input
                placeholder={t("entrySubtitlePlaceholder")}
                {...field}
                id={field.name}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <DateRangeFields
          control={props.control}
          startName={`entries.${props.index}.startDate`}
          endName={`entries.${props.index}.endDate`}
          presentLabel={t("present")}
        />

        <Controller
          control={props.control}
          name={`entries.${props.index}.description`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t("entryDescription")}
              </FieldLabel>
              <RichTextEditor
                id={field.name}
                value={field.value}
                features={PROSE_FEATURES}
                placeholder={t("entryDescriptionPlaceholder")}
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
