import { type Locale, localizePath } from "@lanjut/i18n/routing";
import { useLocale, useTranslations } from "use-intl";
import { IS_DESKTOP } from "@/lib/build-target";
import { guidePath } from "@/lib/guides";

/**
 * The template page's link to the examples guide. The desktop window shows
 * the app only, so it has none.
 */
export function useTemplateGuideLink() {
  const t = useTranslations("platform.templates");
  const locale = useLocale() as Locale;
  if (IS_DESKTOP) return undefined;
  return {
    href: localizePath(guidePath("ats-resume-examples"), locale),
    label: t("exampleLink"),
  };
}
