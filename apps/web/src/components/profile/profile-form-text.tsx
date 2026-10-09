import { Field, FieldError, FieldLabel } from "@lanjut/ui/components/field";
import { Input } from "@lanjut/ui/components/input";
import type { ReactElement } from "react";
import { type Control, Controller } from "react-hook-form";
import type { ProfileForm } from "@/lib/forms/profile";

export type ProfileTextKey = Exclude<keyof ProfileForm, "summary" | "photo">;

interface ProfileFormTextProps {
  control: Control<ProfileForm>;
  name: ProfileTextKey;
  label: string;
  placeholder: string;
  required?: boolean;
  description?: ReactElement;
}

/** One text field of the profile form, through a Controller. */
export function ProfileFormText(props: ProfileFormTextProps) {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={(controller) => {
        const { field, fieldState } = controller;
        return (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel
              htmlFor={field.name}
              aria-required={props.required || undefined}
            >
              {props.label}
            </FieldLabel>
            <Input
              placeholder={props.placeholder}
              aria-invalid={fieldState.invalid || undefined}
              aria-required={props.required || undefined}
              {...field}
              id={field.name}
            />
            {props.description}
            <FieldError errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}
