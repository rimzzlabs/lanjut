import { hasLocale, useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { IS_DESKTOP } from "@/lib/build-target";
import { useSidebarStore } from "@/lib/store";

export function useLocaleSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: string) => {
    if (!hasLocale(routing.locales, next)) return;

    if (IS_DESKTOP) {
      useSidebarStore.getState().setLocale(next);
    }

    startTransition(() => {
      const href = IS_DESKTOP
        ? `${pathname}${window.location.search}`
        : pathname;
      router.replace(href, { locale: next, scroll: false });
    });
  };

  return { locale, isPending, switchLocale };
}
