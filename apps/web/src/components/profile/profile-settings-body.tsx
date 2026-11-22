import type { ProfileSettingsSection } from "@/lib/store";
import { ProfileSettingsAssistant } from "./profile-settings-assistant";
import { ProfileSettingsNew } from "./profile-settings-new";
import { ProfileSettingsPreferences } from "./profile-settings-preferences";
import { ProfileSettingsProfile } from "./profile-settings-profile";

export function ProfileSettingsBody(props: {
  section: ProfileSettingsSection;
}) {
  if (props.section === "preferences") return <ProfileSettingsPreferences />;
  if (props.section === "new") return <ProfileSettingsNew />;
  if (props.section === "assistant") return <ProfileSettingsAssistant />;
  return <ProfileSettingsProfile />;
}
