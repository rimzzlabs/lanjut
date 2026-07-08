import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function useLocaleSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: next as Locale, scroll: false });
    });
  };

  return { locale, isPending, switchLocale };
}
