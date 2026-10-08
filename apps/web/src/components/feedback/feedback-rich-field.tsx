import type { RichTextFeature } from "@lanjut/resume/schema-registry";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@lanjut/ui/components/field";
import { Controller } from "react-hook-form";
import { RichTextField } from "@/components/editor/rich-text/rich-text-field";
import type {
  FeedbackControl,
  FeedbackRichField as RichFieldName,
} from "@/lib/feedback/feedback-form";

/** The marks a feedback answer may carry; GitHub shows each of them. */
const FEEDBACK_FEATURES: RichTextFeature[] = [
  "bold",
  "italic",
  "underline",
  "bulletList",
  "orderedList",
  "link",
];

interface FeedbackRichFieldProps {
  control: FeedbackControl;
  name: RichFieldName;
  label: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
}

/**
 * A long answer in the minimal rich-text editor: lists, bold, italic,
 * underline, and links. It is written as Markdown when the report is sent.
 */
export function FeedbackRichField(props: FeedbackRichFieldProps) {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={(controller) => {
        const { field, fieldState } = controller;
        return (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel
              htmlFor={`feedback-${field.name}`}
              aria-required={props.required || undefined}
            >
              {props.label}
            </FieldLabel>
            <RichTextField
              id={`feedback-${field.name}`}
              value={field.value}
              features={FEEDBACK_FEATURES}
              placeholder={props.placeholder}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
            {props.hint && <FieldDescription>{props.hint}</FieldDescription>}
            <FieldError errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}
