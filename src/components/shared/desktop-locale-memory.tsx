import { useLayoutEffect } from "react";
import { useLocale } from "use-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { isLocale } from "@/i18n/routing";
import { IS_DESKTOP } from "@/lib/build-target";
import { useSidebarStore } from "@/lib/store";

export function DesktopLocaleMemory() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useLayoutEffect(() => {
    if (!IS_DESKTOP || !isLocale(locale)) return;

    void useSidebarStore.persist.rehydrate();
    const storedLocale = useSidebarStore.getState().locale;

    if (!storedLocale) {
      useSidebarStore.getState().setLocale(locale);
      return;
    }

    if (storedLocale !== locale) {
      void router.replace(`${pathname}${window.location.search}`, {
        locale: storedLocale,
      });
    }
  }, [locale, pathname, router]);

  return null;
}
