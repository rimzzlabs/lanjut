import { useTransition } from "react";
import { useLocale } from "use-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { isLocale, LOCALE_COOKIE } from "@/i18n/routing";
import { IS_DESKTOP } from "@/lib/build-target";
import { useSidebarStore } from "@/lib/store";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function useLocaleSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: string) => {
    if (!isLocale(next)) return;

    if (IS_DESKTOP) {
      useSidebarStore.getState().setLocale(next);
    } else {
      // The Worker reads this on the next visit to an unprefixed page.
      // biome-ignore lint/suspicious/noDocumentCookie: one plain preference cookie needs no Cookie Store API
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
    }

    startTransition(() => {
      void router.replace(`${pathname}${window.location.search}`, {
        locale: next,
      });
    });
  };

  return { locale, isPending, switchLocale };
}
