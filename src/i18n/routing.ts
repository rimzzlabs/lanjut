import { defineRouting } from "next-intl/routing";
import { IS_DESKTOP } from "@/lib/build-target";

export const routing = defineRouting({
  locales: ["en", "id"],
  defaultLocale: "en",
  localePrefix: IS_DESKTOP ? "always" : "as-needed",
});

export type Locale = (typeof routing.locales)[number];
