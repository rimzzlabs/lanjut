"use client";

import { useTranslations } from "next-intl";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { routing } from "@/i18n/routing";
import { SegmentedControl } from "./segmented-control";

export function LanguageSwitcher(props: { className?: string }) {
  const t = useTranslations("language");
  const { locale, switchLocale } = useLocaleSwitch();

  const items = routing.locales.map((loc) => ({
    value: loc,
    label: loc.toUpperCase(),
    ariaLabel: t(loc),
  }));

  return (
    <SegmentedControl
      aria-label={t("label")}
      value={locale}
      onValueChange={switchLocale}
      items={items}
      className={props.className}
    />
  );
}
