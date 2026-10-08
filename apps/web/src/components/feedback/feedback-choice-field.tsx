import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@lanjut/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@lanjut/ui/components/radio-group";
import { Controller } from "react-hook-form";
import type { FeedbackControl } from "@/lib/feedback/feedback-form";

type ChoiceField = "frequency" | "impact" | "language";

interface FeedbackChoiceFieldProps {
  control: FeedbackControl;
  name: ChoiceField;
  legend: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

/** One answer out of a few, as radios in a row that wraps on a phone. */
export function FeedbackChoiceField(props: FeedbackChoiceFieldProps) {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={(controller) => {
        const { field } = controller;
        return (
          <FieldSet>
            <FieldLegend variant="label">{props.legend}</FieldLegend>
            <RadioGroup
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
              className="flex flex-wrap gap-x-5 gap-y-2"
            >
              {props.options.map((option) => (
                <Field
                  key={option.value}
                  orientation="horizontal"
                  className="w-auto"
                >
                  <RadioGroupItem
                    id={`feedback-${props.name}-${option.value}`}
                    value={option.value}
                  />
                  <FieldLabel
                    htmlFor={`feedback-${props.name}-${option.value}`}
                    className="font-normal"
                  >
                    {option.label}
                  </FieldLabel>
                </Field>
              ))}
            </RadioGroup>
          </FieldSet>
        );
      }}
    />
  );
}
