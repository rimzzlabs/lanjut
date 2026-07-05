import { Trash } from "lucide-react";
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
  deletable: boolean;
  control: Control<OrganizationsFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionOrganizationsFormItem(
  props: EditorSectionOrganizationsFormItemProps,
) {
  const onRemove = () => {
    props.onRemoveField(props.index);
  };

  return (
    <FieldSet className="not-last-of-type:pb-4 not-last-of-type:border-b">
      <FieldLegend className="sr-only" variant="label">
        Organization {props.index + 1}
      </FieldLegend>

      <FieldGroup className="gap-3">
        <Controller
          control={props.control}
          name={`organizations.${props.index}.role`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Role</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Head of Public Relations"
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
          name={`organizations.${props.index}.organization`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Organization</FieldLabel>
              <Input
                placeholder="Student Executive Board"
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
          presentLabel="I'm currently active here"
        />

        <Controller
          control={props.control}
          name={`organizations.${props.index}.description`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Summary</FieldLabel>
              <RichTextEditor
                id={field.name}
                value={field.value}
                features={PROSE_FEATURES}
                placeholder="Organized events that...."
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
