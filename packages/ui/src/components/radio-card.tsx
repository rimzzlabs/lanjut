import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { cn } from "../lib/utils";

/**
 * A whole card that acts as one radio of a `RadioGroup`. Children style their
 * checked state with `group-data-checked/radio-card:`.
 */
function RadioCard(props: RadioPrimitive.Root.Props) {
  const { className, ...rest } = props;

  return (
    <RadioPrimitive.Root
      data-slot="radio-card"
      className={cn(
        "group/radio-card flex cursor-pointer flex-col rounded-xl border text-left outline-none transition-colors hover:border-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 data-checked:border-primary data-checked:ring-1 data-checked:ring-primary",
        className,
      )}
      {...rest}
    />
  );
}

export { RadioCard };
