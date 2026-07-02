"use client";

import { A, F, O, pipe } from "@mobily/ts-belt";
import { Laptop2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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
  { label: "System", value: "system", icon: Laptop2 },
  { label: "Light", value: "light", icon: Sun },
  { label: "Dark", value: "dark", icon: Moon },
] as const;

export function PlatformNavbarTheme() {
  const { theme, setTheme } = useTheme();

  const selected = pipe(
    THEMES,
    A.find((t) => t.value === theme),
    O.mapWithDefault(THEMES[0], F.identity),
  );

  const onChangeTheme = (next: string) => setTheme(next);

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger
          render={<DropdownMenuTrigger render={<Button variant="outline" />} />}
        >
          <selected.icon /> {selected.label}
        </TooltipTrigger>

        <TooltipContent>Choose theme</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={theme} onValueChange={onChangeTheme}>
            {THEMES.map((t) => (
              <DropdownMenuRadioItem key={t.value} value={t.value}>
                <t.icon /> {t.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
