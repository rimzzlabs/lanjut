import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: ignore
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      {...props}
      className={cn("size-4 animate-spin", className)}
    />
  );
}

export { Spinner };
