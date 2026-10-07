import { CircleNotchIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const t = useTranslations("ui");
  return (
    // biome-ignore lint/a11y/useSemanticElements: ignore
    <CircleNotchIcon
      data-slot="spinner"
      role="status"
      aria-label={t("loading")}
      {...props}
      className={cn("size-4 animate-spin", className)}
    />
  );
}

export { Spinner };
