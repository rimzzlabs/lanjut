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
import { PROSE_FEATURES } from "@/lib/resume/schema-registry";
import { MonthYearMenu } from "../../month-year-menu/month-year-menu";
import { RichTextEditor } from "../../rich-text/rich-text-editor";
import type { ExperienceFormValues } from "../resume-form-adapter";

interface EditorSectionExperienceFormItemProps {
  index: number;
  deletable: boolean;
  control: Control<ExperienceFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionExperienceFormItem(
  props: EditorSectionExperienceFormItemProps,
) {
  const onRemove = () => {
    props.onRemoveField(props.index);
  };

  return (
    <FieldSet className="not-last-of-type:pb-4 not-last-of-type:border-b">
      <FieldLegend className="sr-only" variant="label">
        Experience {props.index + 1}
      </FieldLegend>

      <FieldGroup className="gap-3">
        <Controller
          control={props.control}
          name={`experiences.${props.index}.title`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel aria-required htmlFor={field.name}>
                Job Title
              </FieldLabel>
              <div className="flex items-center gap-2">
                <Input placeholder="UX Engineer" {...field} id={field.name} />
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
          name={`experiences.${props.index}.company`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel aria-required htmlFor={field.name}>
                Company
              </FieldLabel>
              <Input placeholder="Acme Inc." {...field} id={field.name} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={props.control}
          name={`experiences.${props.index}.website`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Company Website</FieldLabel>
              <UrlInput
                id={field.name}
                value={field.value}
                placeholder="acme.com"
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
              <FieldDescription>
                Assuming the site will always support <code>https</code>.
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="grid grid-cols-[minmax(0,1fr)_max-content_minmax(0,1fr)] gap-3">
          <Controller
            control={props.control}
            name={`experiences.${props.index}.startDate`}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel aria-required htmlFor={field.name}>
                  Start Date
                </FieldLabel>
                <MonthYearMenu
                  id={field.name}
                  value={field.value}
                  placeholder="Start date"
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="h-px w-2 bg-muted-foreground mt-12" />

          <Controller
            control={props.control}
            name={`experiences.${props.index}.endDate`}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel aria-required htmlFor={field.name}>
                  End Date
                </FieldLabel>
                <MonthYearMenu
                  id={field.name}
                  value={field.value}
                  placeholder="End date"
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          control={props.control}
          name={`experiences.${props.index}.description`}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel aria-required htmlFor={field.name}>
                Summary
              </FieldLabel>
              <RichTextEditor
                id={field.name}
                value={field.value}
                features={PROSE_FEATURES}
                placeholder="Creating real-time application that...."
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
