import { type Profile, profilePersonName } from "@lanjut/resume";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@lanjut/ui/components/avatar";
import { A, pipe, S } from "@mobily/ts-belt";
import { useProfileLabel } from "@/hooks/use-profile-label";

/** Up to two initials: from the person's name, else from the profile's name. */
function initialsOf(text: string): string {
  return pipe(
    S.split(S.trim(text), " "),
    A.filter(S.isNotEmpty),
    A.take(2),
    A.map((word) => S.toUpperCase(S.slice(word, 0, 1))),
    A.join(""),
  );
}

interface ProfileAvatarProps {
  profile: Profile;
  size?: "sm" | "default" | "lg";
  className?: string;
}

/** The profile's photo, or its initials when it has none. */
export function ProfileAvatar(props: ProfileAvatarProps) {
  const label = useProfileLabel(props.profile);
  const person = profilePersonName(props.profile);
  const initials = initialsOf(S.isEmpty(person) ? label : person);

  return (
    <Avatar size={props.size} className={props.className}>
      {props.profile.header.photo && (
        <AvatarImage src={props.profile.header.photo} alt="" />
      )}
      <AvatarFallback className="bg-primary/15 font-medium text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
