"use client";

import { hasLocale, useLocale } from "next-intl";
import { useLayoutEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { IS_DESKTOP } from "@/lib/build-target";
import { useSidebarStore } from "@/lib/store";

export function DesktopLocaleMemory() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useLayoutEffect(() => {
    if (!IS_DESKTOP || !hasLocale(routing.locales, locale)) return;

    void useSidebarStore.persist.rehydrate();
    const storedLocale = useSidebarStore.getState().locale;

    if (!storedLocale) {
      useSidebarStore.getState().setLocale(locale);
      return;
    }

    if (storedLocale !== locale) {
      router.replace(`${pathname}${window.location.search}`, {
        locale: storedLocale,
        scroll: false,
      });
    }
  }, [locale, pathname, router]);

  return null;
}
