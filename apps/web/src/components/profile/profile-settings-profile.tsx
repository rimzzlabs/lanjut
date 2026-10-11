import { useTranslations } from "use-intl";
import {
  selectActiveProfile,
  selectCanDeleteProfile,
  useProfileStore,
} from "@/lib/store";
import { ProfileDelete } from "./profile-delete";
import { ProfileLockedForm } from "./profile-locked-form";
import { ProfileSettingsHeading } from "./profile-settings-heading";

/** The active profile's data, saved on submit. */
export function ProfileSettingsProfile() {
  const t = useTranslations("profile");
  const profile = useProfileStore(selectActiveProfile);
  const canDelete = useProfileStore(selectCanDeleteProfile);

  return (
    <div className="flex flex-col gap-8">
      <ProfileSettingsHeading
        title={t("profileSection")}
        description={t("profileDescription")}
      />
      <ProfileLockedForm profile={profile} />
      {canDelete && <ProfileDelete key={profile.id} profile={profile} />}
    </div>
  );
}
