import { Input as InputPrimitive } from "@base-ui/react/input";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Input(props: React.ComponentProps<"input">) {
  // A controlled input (one with `onChange`) must never receive an `undefined`
  // value, or base-ui warns when it later becomes a string (uncontrolled →
  // controlled), e.g. react-hook-form's `values` before its first sync.
  const value = props.onChange && props.value === undefined ? "" : props.value;
  return (
    <InputPrimitive
      data-slot="input"
      {...props}
      value={value}
      className={cn(
        "h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 py-1 text-base transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        props.className,
      )}
    />
  );
}

export { Input };
