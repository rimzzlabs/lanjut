import { Button } from "@lanjut/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lanjut/ui/components/dropdown-menu";
import {
  GearSixIcon,
  PlusIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useHydrateProfiles } from "@/hooks/use-hydrate-profiles";
import { useProfileLabel } from "@/hooks/use-profile-label";
import {
  selectActiveProfile,
  useProfileSettingsStore,
  useProfileStore,
} from "@/lib/store";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileMenuHeader } from "./profile-menu-header";
import { ProfileMenuSwitch } from "./profile-menu-switch";

/**
 * The active profile in the top bar, as its avatar alone, the same 36px as the
 * GitHub button beside it. It opens the profile card, the switch between
 * profiles, and the way to settings, preferences, and a new profile.
 */
export function ProfileMenu() {
  useHydrateProfiles();
  const t = useTranslations("profile");
  const profile = useProfileStore(selectActiveProfile);
  const openAt = useProfileSettingsStore((state) => state.openAt);
  const label = useProfileLabel(profile);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full p-0" />
        }
      >
        <ProfileAvatar profile={profile} className="size-9" />
        <span className="sr-only">{t("menuLabel", { name: label })}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-72">
        <ProfileMenuHeader profile={profile} />
        <DropdownMenuSeparator />
        <ProfileMenuSwitch />
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openAt("profile")}>
            <GearSixIcon /> {t("settings")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openAt("preferences")}>
            <SlidersHorizontalIcon /> {t("preferences")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openAt("new")}>
            <PlusIcon /> {t("addProfile")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
