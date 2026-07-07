import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
import { UrlInput } from "@/components/shared/url-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CertificationsFormValues } from "../resume-form-adapter";

interface EditorSectionCertificationsFormItemProps {
  index: number;
  control: Control<CertificationsFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionCertificationsFormItem(
  props: EditorSectionCertificationsFormItemProps,
) {
  const t = useTranslations("editor.certifications");
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
          name={`certifications.${props.index}.name`}
          render={({ field, fieldState }) => (
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
          name={`certifications.${props.index}.issuer`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("issuer")}</FieldLabel>
              <Input
                placeholder={t("issuerPlaceholder")}
                {...field}
                id={field.name}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={props.control}
          name={`certifications.${props.index}.url`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t("url")}</FieldLabel>
              <UrlInput
                id={field.name}
                value={field.value}
                placeholder={t("urlPlaceholder")}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
              <FieldDescription>{t("urlDesc")}</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
}
