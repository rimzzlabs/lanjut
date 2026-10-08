import { Field, FieldLabel } from "@lanjut/ui/components/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lanjut/ui/components/select";
import { A } from "@mobily/ts-belt";
import { Controller } from "react-hook-form";
import { useTranslations } from "use-intl";
import type { FeedbackControl } from "@/lib/feedback/feedback-form";
import {
  FEEDBACK_AREAS,
  type FeedbackArea,
} from "@/lib/feedback/feedback-schema";

/** Where in Lanjut the report is about, prefilled from where it was opened. */
export function FeedbackAreaField(props: {
  control: FeedbackControl;
  label: string;
}) {
  const t = useTranslations("feedback.areas");
  const items = A.map(FEEDBACK_AREAS, (area) => ({
    value: area,
    label: t(area),
  }));

  return (
    <Controller
      control={props.control}
      name="area"
      render={(controller) => {
        const { field } = controller;
        return (
          <Field>
            <FieldLabel htmlFor="feedback-area">{props.label}</FieldLabel>
            <Select
              items={items}
              value={field.value}
              onValueChange={(value) => field.onChange(value as FeedbackArea)}
            >
              <SelectTrigger id="feedback-area" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} align="start">
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        );
      }}
    />
  );
}
