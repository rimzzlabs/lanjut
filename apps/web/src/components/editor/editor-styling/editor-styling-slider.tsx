import { Slider } from "@lanjut/ui/components/slider";
import { useId } from "react";

interface EditorStylingSliderProps {
  label: string;
  value: number;
  /** The value as the person reads it, such as "100%" or "+12 px". */
  display: string;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
}

function firstValue(value: number | readonly number[]): number {
  return Array.isArray(value) ? value[0] : (value as number);
}

/** A styling slider row: its label and current value, then the slider. */
export function EditorStylingSlider(props: EditorStylingSliderProps) {
  const labelId = useId();

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_8.5rem] items-center gap-x-4">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <span id={labelId} className="truncate text-sm text-muted-foreground">
          {props.label}
        </span>
        <span className="shrink-0 text-xs text-foreground/80 tabular-nums">
          {props.display}
        </span>
      </div>
      <Slider
        aria-labelledby={labelId}
        value={props.value}
        onValueChange={(next) => props.onValueChange(firstValue(next))}
        min={props.min}
        max={props.max}
        step={props.step}
      />
    </div>
  );
}
