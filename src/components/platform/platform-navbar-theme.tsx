"use client";

import { A, F, O, pipe } from "@mobily/ts-belt";
import { Laptop2, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useIsClient } from "@/hooks/use-is-client";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const THEMES = [
  { value: "system", icon: Laptop2 },
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
] as const;

export function PlatformNavbarTheme() {
  const mounted = useIsClient();
  const { theme, setTheme } = useTheme();
  const t = useTranslations("platform.theme");

  const selected = pipe(
    THEMES,
    A.find((t) => t.value === theme),
    O.mapWithDefault(THEMES[0], F.identity),
  );

  const onChangeTheme = (next: string) => setTheme(next);

  if (!mounted) return null;

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger
          suppressHydrationWarning
          render={<DropdownMenuTrigger render={<Button variant="outline" />} />}
        >
          <selected.icon /> {t(selected.value)}
        </TooltipTrigger>

        <TooltipContent>{t("choose")}</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={theme} onValueChange={onChangeTheme}>
            {THEMES.map((item) => (
              <DropdownMenuRadioItem key={item.value} value={item.value}>
                <item.icon /> {t(item.value)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
