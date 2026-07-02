import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { MonthYearMenu } from "../month-year-menu/month-year-menu";
import { PRESENT_DATE } from "../month-year-menu/month-year-menu-data";

interface DateRangeFieldsProps<T extends FieldValues> {
  control: Control<T>;
  startName: FieldPath<T>;
  endName: FieldPath<T>;
  /** Checkbox label, e.g. "I currently work here". */
  presentLabel: string;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Start/end month-year pickers plus a "currently here" checkbox. Checking it sets
 * the end date to the `PRESENT_DATE` sentinel (which the preview renders as
 * "Present") and hides the end picker; unchecking clears it back to a date.
 */
export function DateRangeFields<T extends FieldValues>(
  props: DateRangeFieldsProps<T>,
) {
  const start = useController({
    control: props.control,
    name: props.startName,
  });
  const end = useController({ control: props.control, name: props.endName });
  const isPresent = asString(end.field.value) === PRESENT_DATE;
  const presentId = `${end.field.name}-present`;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(0,1fr)_max-content_minmax(0,1fr)] gap-3">
        <Field>
          <FieldLabel htmlFor={start.field.name}>Start Date</FieldLabel>
          <MonthYearMenu
            id={start.field.name}
            value={asString(start.field.value)}
            placeholder="Start date"
            onChange={start.field.onChange}
          />
          <FieldError errors={[start.fieldState.error]} />
        </Field>

        <div className="mt-12 h-px w-2 bg-muted-foreground" />

        <Field>
          <FieldLabel htmlFor={end.field.name}>End Date</FieldLabel>
          {isPresent ? (
            <Button
              type="button"
              variant="outline"
              disabled
              className="w-full justify-start font-normal text-muted-foreground"
            >
              Present
            </Button>
          ) : (
            <MonthYearMenu
              id={end.field.name}
              value={asString(end.field.value)}
              placeholder="End date"
              onChange={end.field.onChange}
            />
          )}
          <FieldError errors={[end.fieldState.error]} />
        </Field>
      </div>

      <div className="flex w-fit items-center gap-2">
        <Checkbox
          id={presentId}
          checked={isPresent}
          onCheckedChange={(checked) =>
            end.field.onChange(checked ? PRESENT_DATE : "")
          }
        />
        <FieldLabel htmlFor={presentId} className="font-normal">
          {props.presentLabel}
        </FieldLabel>
      </div>
    </div>
  );
}
