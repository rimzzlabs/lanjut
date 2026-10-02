import { createTranslator } from "use-intl/core";
import { MESSAGES } from "./messages";
import type { Locale } from "./routing";

/** Translations for `.astro` files and build scripts, outside any React tree. */
export function getTranslator<Namespace extends string>(
  locale: Locale,
  namespace: Namespace,
) {
  return createTranslator({
    locale,
    messages: MESSAGES[locale],
    namespace: namespace as never,
  }) as (key: string, values?: Record<string, string | number>) => string;
}
