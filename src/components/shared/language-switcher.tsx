"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
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

export function LanguageSwitcher(props: { className?: string }) {
  const t = useTranslations("language");
  const { locale, isPending, switchLocale } = useLocaleSwitch();

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  disabled={isPending}
                  className={cn(props.className)}
                />
              }
            />
          }
        >
          <Languages /> {t(locale)}
        </TooltipTrigger>

        <TooltipContent>{t("choose")}</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={locale} onValueChange={switchLocale}>
            {routing.locales.map((loc) => (
              <DropdownMenuRadioItem key={loc} value={loc}>
                {t(loc)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
