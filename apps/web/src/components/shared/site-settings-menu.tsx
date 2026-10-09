import { routing } from "@lanjut/i18n/routing";
import { Button } from "@lanjut/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lanjut/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lanjut/ui/components/tooltip";
import {
  LaptopIcon,
  PowerIcon,
  SlidersHorizontalIcon,
  TranslateIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { isMotionSetting, useMotionStore } from "@/lib/store";

const MOTION_OPTIONS = [
  {
    value: "system",
    icon: LaptopIcon,
    weight: "regular",
    labelKey: "animationSystem",
  },
  { value: "on", icon: PowerIcon, weight: "fill", labelKey: "animationOn" },
  {
    value: "off",
    icon: PowerIcon,
    weight: "regular",
    labelKey: "animationOff",
  },
] as const;

interface SiteSettingsMenuProps {
  side?: "top" | "bottom";
  variant?: "ghost" | "outline";
  className?: string;
}

/** Language and animation in one menu. */
export function SiteSettingsMenu(props: SiteSettingsMenuProps) {
  const t = useTranslations("nav");

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon"
                  variant={props.variant ?? "ghost"}
                  className={props.className}
                />
              }
            />
          }
        >
          <SlidersHorizontalIcon />
          <span className="sr-only">{t("settings")}</span>
        </TooltipTrigger>
        <TooltipContent>{t("settings")}</TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        align="end"
        side={props.side}
        sideOffset={12}
        className="min-w-44"
      >
        <SiteSettingsLanguage />
        <DropdownMenuSeparator />
        <SiteSettingsMotion />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SiteSettingsLanguage() {
  const t = useTranslations("language");
  const { locale, switchLocale } = useLocaleSwitch();

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={locale} onValueChange={switchLocale}>
        {routing.locales.map((item) => (
          <DropdownMenuRadioItem key={item} value={item}>
            <TranslateIcon /> {t(item)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuGroup>
  );
}

function SiteSettingsMotion() {
  const t = useTranslations("nav");
  const setting = useMotionStore((state) => state.setting);
  const setSetting = useMotionStore((state) => state.setSetting);

  function changeSetting(next: string) {
    if (isMotionSetting(next)) setSetting(next);
  }

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>{t("animation")}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={setting} onValueChange={changeSetting}>
        {MOTION_OPTIONS.map((item) => (
          <DropdownMenuRadioItem key={item.value} value={item.value}>
            <item.icon weight={item.weight} /> {t(item.labelKey)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuGroup>
  );
}
