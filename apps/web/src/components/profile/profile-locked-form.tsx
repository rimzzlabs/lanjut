import type { Profile } from "@lanjut/resume";
import { revisionOf } from "@lanjut/resume/db";
import { useTranslations } from "use-intl";
import { EditLockFrame } from "@/components/shared/edit-lock-frame";
import { useEditLock } from "@/hooks/use-edit-lock";
import type { EditLockHooks } from "@/lib/edit-lock";
import { useProfileStore } from "@/lib/store";
import { syncProfilesFromDisk } from "@/lib/store/profile-store";
import { ProfileForm } from "./profile-form";

// A profile saves on submit, so nothing is pending when this window gives it
// up. After a takeover, the form loads what the other window saved.
const PROFILE_LOCK: EditLockHooks = { afterTake: syncProfilesFromDisk };

/**
 * A saved profile's form. One window edits a profile at a time: another
 * window that shows it is frozen. The form remounts on a new revision.
 */
export function ProfileLockedForm(props: { profile: Profile }) {
  const { profile } = props;
  const t = useTranslations("profile");
  const saveProfile = useProfileStore((state) => state.saveProfile);
  const lock = useEditLock("profile", profile.id, PROFILE_LOCK);

  return (
    <EditLockFrame
      item="profile"
      frozen={lock.frozen}
      taking={lock.taking}
      onTakeOver={lock.takeOver}
    >
      <ProfileForm
        key={`${profile.id}:${revisionOf(profile)}`}
        profile={profile}
        submitLabel={t("save")}
        onSubmit={saveProfile}
      />
    </EditLockFrame>
  );
}
