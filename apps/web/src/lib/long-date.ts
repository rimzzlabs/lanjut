import type { Locale } from "@lanjut/i18n/routing";

/** A `YYYY-MM-DD` date in words, read in UTC so a build in any time zone agrees. */
export function longDate(locale: Locale, isoDate: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
