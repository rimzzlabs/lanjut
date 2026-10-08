import { routing } from "@lanjut/i18n/routing";
import { A } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { isMotionSetting, useMotionStore } from "@/lib/store";
import { ProfilePreferenceRow } from "./profile-preference-row";
import { ProfileSettingsHeading } from "./profile-settings-heading";
import { ProfileThemePicker } from "./profile-theme-picker";

const MOTION_SETTINGS = ["system", "on", "off"] as const;

const MOTION_LABEL_KEYS: Record<(typeof MOTION_SETTINGS)[number], string> = {
  system: "animationSystem",
  on: "animationOn",
  off: "animationOff",
};

/** How the app looks and moves on this device: theme, language, animation. */
export function ProfileSettingsPreferences() {
  const t = useTranslations();
  const { locale, switchLocale } = useLocaleSwitch();
  const motion = useMotionStore((state) => state.setting);
  const setMotion = useMotionStore((state) => state.setSetting);

  return (
    <div className="flex flex-col gap-4">
      <ProfileSettingsHeading
        title={t("profile.preferences")}
        description={t("profile.preferencesDescription")}
      />

      <div className="flex flex-col divide-y">
        <ProfilePreferenceRow
          stacked
          label={t("profile.theme")}
          description={t("profile.themeDescription")}
        >
          <ProfileThemePicker />
        </ProfilePreferenceRow>

        <ProfilePreferenceRow
          label={t("language.label")}
          description={t("profile.languageDescription")}
        >
          <SegmentedControl
            aria-label={t("language.label")}
            value={locale}
            onValueChange={switchLocale}
            items={A.map(routing.locales, (value) => ({
              value,
              label: t(`language.${value}`),
            }))}
          />
        </ProfilePreferenceRow>

        <ProfilePreferenceRow
          label={t("nav.animation")}
          description={t("profile.animationDescription")}
        >
          <SegmentedControl
            aria-label={t("nav.animation")}
            value={motion}
            onValueChange={(value) => {
              if (isMotionSetting(value)) setMotion(value);
            }}
            items={A.map(MOTION_SETTINGS, (value) => ({
              value,
              label: t(`nav.${MOTION_LABEL_KEYS[value]}`),
            }))}
          />
        </ProfilePreferenceRow>
      </div>
    </div>
  );
}
