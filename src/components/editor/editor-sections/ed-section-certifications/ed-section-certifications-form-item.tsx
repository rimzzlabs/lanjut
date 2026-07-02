import { Trash } from "lucide-react";
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
  deletable: boolean;
  control: Control<CertificationsFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionCertificationsFormItem(
  props: EditorSectionCertificationsFormItemProps,
) {
  const onRemove = () => {
    props.onRemoveField(props.index);
  };

  return (
    <FieldSet className="not-last-of-type:pb-4 not-last-of-type:border-b">
      <FieldLegend className="sr-only" variant="label">
        Certification {props.index + 1}
      </FieldLegend>
      <FieldGroup className="gap-3">
        <Controller
          control={props.control}
          name={`certifications.${props.index}.name`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="AWS Certified Solutions Architect"
                  {...field}
                  id={field.name}
                />
                {props.deletable && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={onRemove}
                  >
                    <Trash className="size-3.5 stroke-destructive" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
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
              <FieldLabel htmlFor={field.name}>Issuer</FieldLabel>
              <Input
                placeholder="Amazon Web Services"
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
              <FieldLabel htmlFor={field.name}>Certificate URL</FieldLabel>
              <UrlInput
                id={field.name}
                value={field.value}
                placeholder="acme.com/cert"
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
              <FieldDescription>
                Link to the certificate or the issuer's site.
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
}
