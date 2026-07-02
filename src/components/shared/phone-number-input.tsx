"use client";

import PhoneInput from "react-phone-number-input/input";
import { Input } from "@/components/ui/input";

interface PhoneNumberInputProps {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

/**
 * Phone field backed by `react-phone-number-input`'s flag-less input: formats as
 * you type and stores an E.164 value (e.g. "+62812345678"). With no `country`
 * given, the input only accepts numbers entered in international format (leading
 * `+` country code), so no country selector is needed.
 */
export function PhoneNumberInput(props: PhoneNumberInputProps) {
  return (
    <PhoneInput
      id={props.id}
      value={props.value || undefined}
      placeholder={props.placeholder}
      inputComponent={Input}
      onChange={(value) => props.onChange(value ?? "")}
      onBlur={props.onBlur}
    />
  );
}
