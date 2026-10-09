import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@lanjut/ui/components/field";
import { Input } from "@lanjut/ui/components/input";
import { Textarea } from "@lanjut/ui/components/textarea";
import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import type {
  FeedbackControl,
  FeedbackTextField as TextFieldName,
} from "@/lib/feedback/feedback-form";

interface FeedbackTextFieldProps {
  control: FeedbackControl;
  name: TextFieldName;
  label: string;
  hint?: string;
  placeholder?: string;
  /** Marks the label with the red asterisk from the start. */
  required?: boolean;
  /** A textarea of this many rows instead of a one-line input. */
  rows?: number;
  maxLength?: number;
  /** Sits under the field, such as the similar issues under the title. */
  children?: ReactNode;
}

/** One text field of the feedback form, through a Controller. */
export function FeedbackTextField(props: FeedbackTextFieldProps) {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={(controller) => {
        const { field, fieldState } = controller;
        const shared = {
          id: `feedback-${field.name}`,
          value: field.value,
          onChange: field.onChange,
          onBlur: field.onBlur,
          placeholder: props.placeholder,
          maxLength: props.maxLength,
          "aria-invalid": fieldState.invalid || undefined,
          "aria-required": props.required || undefined,
        };
        return (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel
              htmlFor={shared.id}
              aria-required={props.required || undefined}
            >
              {props.label}
            </FieldLabel>
            {props.rows !== undefined && (
              <Textarea {...shared} rows={props.rows} className="resize-y" />
            )}
            {props.rows === undefined && <Input {...shared} />}
            {props.hint && <FieldDescription>{props.hint}</FieldDescription>}
            <FieldError errors={[fieldState.error]} />
            {props.children}
          </Field>
        );
      }}
    />
  );
}
