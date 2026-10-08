import type { Profile } from "@lanjut/resume";
import { Badge } from "@lanjut/ui/components/badge";
import { Button } from "@lanjut/ui/components/button";
import { S } from "@mobily/ts-belt";
import { CheckIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useProfileLabel } from "@/hooks/use-profile-label";
import { useProfileStore } from "@/lib/store";
import { ProfileAvatar } from "./profile-avatar";
import { profileDetailText } from "./profile-detail-text";

/**
 * Who the profile is, and whether it fills new résumés. A profile that is
 * not active offers to become the active one.
 */
export function ProfileDetailHeader(props: { profile: Profile }) {
  const t = useTranslations("profile");
  const label = useProfileLabel(props.profile);
  const detail = profileDetailText(props.profile);
  const activeId = useProfileStore((state) => state.activeId);
  const setActive = useProfileStore((state) => state.setActive);
  const active = activeId === props.profile.id;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <ProfileAvatar profile={props.profile} className="size-12" />
      <div className="mr-auto flex min-w-0 flex-col gap-0.5">
        <h2 className="truncate text-lg font-semibold tracking-tight">
          {label}
        </h2>
        {S.isNotEmpty(detail) && (
          <p className="truncate text-sm text-muted-foreground">{detail}</p>
        )}
      </div>
      {active && (
        <Badge variant="secondary" className="gap-1">
          <CheckIcon weight="bold" />
          {t("active")}
        </Badge>
      )}
      {!active && (
        <Button
          variant="outline"
          onClick={() => void setActive(props.profile.id)}
        >
          {t("useProfile")}
        </Button>
      )}
    </div>
  );
}
