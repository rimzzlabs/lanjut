import type { ProfileSettingsSection } from "@/lib/store";
import { ProfileSettingsNew } from "./profile-settings-new";
import { ProfileSettingsPreferences } from "./profile-settings-preferences";
import { ProfileSettingsProfile } from "./profile-settings-profile";

export function ProfileSettingsBody(props: {
  section: ProfileSettingsSection;
}) {
  if (props.section === "preferences") return <ProfileSettingsPreferences />;
  if (props.section === "new") return <ProfileSettingsNew />;
  return <ProfileSettingsProfile />;
}
