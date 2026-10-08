import type { Profile } from "@lanjut/resume";
import { D, O } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { useProfileResumeCounts } from "@/hooks/use-profile-resumes";
import { ProfileListDraft } from "./profile-list-draft";
import { ProfileListItem } from "./profile-list-item";

interface ProfileListProps {
  profiles: ReadonlyArray<Profile>;
  activeId: string;
  selectedId: string;
  onOpen: (id: string) => void;
  /** Shows the profile being added as the current row. */
  draft: boolean;
}

/** Every profile as a row. A row opens that profile's information. */
export function ProfileList(props: ProfileListProps) {
  const t = useTranslations("profile");
  const counts = useProfileResumeCounts();

  return (
    <ul aria-label={t("profiles")} className="flex flex-col gap-3">
      {props.profiles.map((profile) => (
        <li key={profile.id}>
          <ProfileListItem
            profile={profile}
            active={profile.id === props.activeId}
            selected={profile.id === props.selectedId}
            count={O.getWithDefault(D.get(counts, profile.id), 0)}
            onOpen={() => props.onOpen(profile.id)}
          />
        </li>
      ))}
      {props.draft && (
        <li>
          <ProfileListDraft />
        </li>
      )}
    </ul>
  );
}
