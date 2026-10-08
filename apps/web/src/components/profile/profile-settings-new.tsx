import { createProfile } from "@lanjut/resume";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { useProfileSettingsStore, useProfileStore } from "@/lib/store";
import { ProfileForm } from "./profile-form";
import { ProfileSettingsHeading } from "./profile-settings-heading";

/** A new profile. Saving it makes it the active one and shows its settings. */
export function ProfileSettingsNew() {
  const t = useTranslations("profile");
  const [draft] = useState(() => createProfile(""));
  const addProfile = useProfileStore((state) => state.addProfile);
  const openAt = useProfileSettingsStore((state) => state.openAt);

  return (
    <div className="flex flex-col gap-8">
      <ProfileSettingsHeading
        title={t("newTitle")}
        description={t("newDescription")}
      />
      <ProfileForm
        profile={draft}
        submitLabel={t("create")}
        onSubmit={async (profile) => {
          await addProfile(profile);
          openAt("profile");
        }}
      />
    </div>
  );
}
