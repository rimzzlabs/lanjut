import type { Profile } from "@lanjut/resume";
import { Badge } from "@lanjut/ui/components/badge";
import { A, pipe, S } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { useProfileLabel } from "@/hooks/use-profile-label";
import { ProfileAvatar } from "./profile-avatar";
import { profileDetailText } from "./profile-detail-text";

interface ProfileListItemProps {
  profile: Profile;
  active: boolean;
  selected: boolean;
  count: number;
  onOpen: () => void;
}

/**
 * One profile: its avatar, name, person, job title, how many résumés it
 * holds, and whether it is active.
 */
export function ProfileListItem(props: ProfileListItemProps) {
  const t = useTranslations("profile");
  const label = useProfileLabel(props.profile);
  const detail = profileDetailText(props.profile);

  return (
    <button
      type="button"
      aria-current={props.selected ? "true" : undefined}
      onClick={props.onOpen}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 text-left outline-none transition-colors hover:border-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-current:border-primary aria-current:ring-1 aria-current:ring-primary"
    >
      <ProfileAvatar profile={props.profile} size="lg" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{label}</span>
        <span className="truncate text-xs text-muted-foreground">
          {pipe(
            [detail, t("resumeCount", { count: props.count })],
            A.filter(S.isNotEmpty),
            A.join(" · "),
          )}
        </span>
      </span>
      {props.active && <Badge variant="secondary">{t("active")}</Badge>}
    </button>
  );
}
