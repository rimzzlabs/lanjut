import { Button } from "@lanjut/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lanjut/ui/components/tooltip";
import { CircleHalfIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useTranslations } from "use-intl";

interface SiteThemeToggleProps {
  variant?: "ghost" | "outline";
  className?: string;
}

/** Switches to the opposite of the theme on screen, so "system" resolves first. */
export function SiteThemeToggle(props: SiteThemeToggleProps) {
  const t = useTranslations("nav");
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon"
            variant={props.variant ?? "ghost"}
            className={props.className}
            onClick={toggleTheme}
          />
        }
      >
        <CircleHalfIcon weight="fill" />
        <span className="sr-only">{t("toggleTheme")}</span>
      </TooltipTrigger>
      <TooltipContent>{t("toggleTheme")}</TooltipContent>
    </Tooltip>
  );
}
