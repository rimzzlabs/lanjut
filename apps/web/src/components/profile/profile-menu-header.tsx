import { type Profile, profilePersonName } from "@lanjut/resume";
import { S } from "@mobily/ts-belt";
import { useProfileLabel } from "@/hooks/use-profile-label";
import { ProfileAvatar } from "./profile-avatar";

/**
 * The card at the top of the profile menu: the avatar, the profile's name,
 * and the person and email it holds. It sits 4px inside the `rounded-md`
 * menu, so `rounded-sm` keeps the corners concentric.
 */
export function ProfileMenuHeader(props: { profile: Profile }) {
  const label = useProfileLabel(props.profile);
  const person = profilePersonName(props.profile);
  const email = props.profile.header.fields.email;
  const contact = email?.kind === "plain" ? S.trim(email.value) : "";

  return (
    <div className="flex flex-col items-center gap-2 rounded-sm bg-muted/60 px-3 py-4 text-center">
      <ProfileAvatar profile={props.profile} size="lg" />
      <div className="flex min-w-0 max-w-full flex-col">
        <span className="truncate text-sm font-medium">{label}</span>
        {S.isNotEmpty(person) && (
          <span className="truncate text-xs text-muted-foreground">
            {person}
          </span>
        )}
        {S.isNotEmpty(contact) && (
          <span className="truncate text-xs text-muted-foreground">
            {contact}
          </span>
        )}
      </div>
    </div>
  );
}
