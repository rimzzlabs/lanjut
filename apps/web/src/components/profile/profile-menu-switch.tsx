import type { Profile } from "@lanjut/resume";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@lanjut/ui/components/dropdown-menu";
import { S } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { useProfileLabel } from "@/hooks/use-profile-label";
import { useProfileResumeCountText } from "@/hooks/use-profile-resumes";
import { useProfileStore } from "@/lib/store";
import { ProfileAvatar } from "./profile-avatar";

/**
 * Every profile, one checked: the one whose résumés the library shows and
 * whose information fills new résumés.
 */
export function ProfileMenuSwitch() {
  const t = useTranslations("profile");
  const profiles = useProfileStore((state) => state.profiles);
  const activeId = useProfileStore((state) => state.activeId);
  const setActive = useProfileStore((state) => state.setActive);

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>{t("profiles")}</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={activeId}
        onValueChange={(value) => void setActive(value as string)}
      >
        {profiles.map((profile) => (
          <ProfileMenuSwitchItem key={profile.id} profile={profile} />
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuGroup>
  );
}

function ProfileMenuSwitchItem(props: { profile: Profile }) {
  const label = useProfileLabel(props.profile);
  const countText = useProfileResumeCountText(props.profile.id);

  return (
    <DropdownMenuRadioItem value={props.profile.id}>
      <ProfileAvatar profile={props.profile} size="sm" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate">{label}</span>
        {S.isNotEmpty(countText) && (
          <span className="text-xs text-muted-foreground">{countText}</span>
        )}
      </span>
    </DropdownMenuRadioItem>
  );
}
