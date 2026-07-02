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
import type { EducationFormValues } from "../resume-form-adapter";

interface EditorSectionEducationFormItemProps {
  index: number;
  deletable: boolean;
  control: Control<EducationFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionEducationFormItem(
  props: EditorSectionEducationFormItemProps,
) {
  const onRemove = () => {
    props.onRemoveField(props.index);
  };

  return (
    <FieldSet className="not-last-of-type:pb-4 not-last-of-type:border-b">
      <FieldLegend className="sr-only" variant="label">
        Education {props.index + 1}
      </FieldLegend>
      <FieldGroup className="gap-3">
        <Controller
          control={props.control}
          name={`educations.${props.index}.institution`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Institution</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="State University"
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
          name={`educations.${props.index}.degree`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Degree</FieldLabel>
              <Input
                placeholder="B.Sc. Computer Science"
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
              <FieldLabel htmlFor={field.name}>Location</FieldLabel>
              <Input placeholder="Boston, MA" {...field} id={field.name} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <DateRangeFields
          control={props.control}
          startName={`educations.${props.index}.startDate`}
          endName={`educations.${props.index}.endDate`}
          presentLabel="I currently study here"
        />

        <Controller
          control={props.control}
          name={`educations.${props.index}.details`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Details</FieldLabel>
              <RichTextEditor
                id={field.name}
                value={field.value}
                features={PROSE_FEATURES}
                placeholder="Graduated with honors. Relevant coursework…"
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
