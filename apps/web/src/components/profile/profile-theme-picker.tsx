import { RadioCard } from "@lanjut/ui/components/radio-card";
import { RadioGroup } from "@lanjut/ui/components/radio-group";
import { useTheme } from "next-themes";
import { useTranslations } from "use-intl";
import { ProfileThemeMockup } from "./profile-theme-mockup";

const THEMES = [
  { value: "light", labelKey: "themeLight" },
  { value: "dark", labelKey: "themeDark" },
  { value: "system", labelKey: "themeSystem" },
] as const;

/**
 * The theme as three pictures of the app, each named underneath. The card
 * holds the picture alone, so it stays a balanced frame; the name sits
 * outside it, and the wrapping `<label>` names the radio and makes the text
 * clickable too.
 *
 * The radii follow the item's width (container units), so a narrow card on a
 * phone is not as round as a wide one: the card is 7cqw (16px at 230px wide),
 * the picture sits 2.6cqw and the 1px border inside it, and its radius is the
 * card's less that gap, so the corners stay concentric at every width.
 */
export function ProfileThemePicker() {
  const t = useTranslations("profile");
  const { theme, setTheme } = useTheme();

  return (
    <RadioGroup
      aria-label={t("theme")}
      value={theme ?? "system"}
      onValueChange={(value) => setTheme(value as string)}
      className="grid grid-cols-3 gap-2 md:gap-3"
    >
      {THEMES.map((item) => (
        // biome-ignore lint/a11y/noLabelWithoutControl: the radio is the RadioCard inside, a base-ui button with role="radio".
        <label
          key={item.value}
          className="@container flex cursor-pointer flex-col gap-2 text-sm text-muted-foreground transition-colors has-data-checked:font-medium has-data-checked:text-foreground"
        >
          <RadioCard value={item.value} className="rounded-[7cqw] p-[2.6cqw]">
            <div className="relative aspect-16/10 overflow-hidden rounded-[calc(4.4cqw-1px)]">
              <ProfileThemeMockup
                theme={item.value === "dark" ? "dark" : "light"}
              />
              {item.value === "system" && (
                <ProfileThemeMockup
                  theme="dark"
                  className="absolute inset-0 [clip-path:polygon(60%_0,100%_0,100%_100%,40%_100%)]"
                />
              )}
            </div>
          </RadioCard>
          <span className="text-center">{t(item.labelKey)}</span>
        </label>
      ))}
    </RadioGroup>
  );
}
