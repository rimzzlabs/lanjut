import type { Profile } from "@lanjut/resume";
import { S } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";

/** A profile's own name, or the guest label before the person names it. */
export function profileLabelOf(profile: Profile, guest: string): string {
  if (S.isEmpty(S.trim(profile.name))) return guest;
  return profile.name;
}

/** The name a profile shows: its own, or "Guest" before the person saves one. */
export function useProfileLabel(profile: Profile): string {
  const t = useTranslations("profile");
  return profileLabelOf(profile, t("guest"));
}
