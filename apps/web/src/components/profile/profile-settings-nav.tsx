import { profilePersonName } from "@lanjut/resume";
import { Button } from "@lanjut/ui/components/button";
import { S } from "@mobily/ts-belt";
import {
  type Icon,
  PlusIcon,
  SlidersHorizontalIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useProfileLabel } from "@/hooks/use-profile-label";
import {
  type ProfileSettingsSection,
  selectActiveProfile,
  useProfileSettingsStore,
  useProfileStore,
} from "@/lib/store";
import { ProfileAvatar } from "./profile-avatar";

const SECTIONS: ReadonlyArray<{
  section: ProfileSettingsSection;
  labelKey: string;
  icon: Icon;
}> = [
  { section: "profile", labelKey: "profileSection", icon: UserCircleIcon },
  {
    section: "preferences",
    labelKey: "preferences",
    icon: SlidersHorizontalIcon,
  },
  { section: "new", labelKey: "addProfile", icon: PlusIcon },
];

/** From `lg`: the active profile over the list of settings sections. */
export function ProfileSettingsNav() {
  const t = useTranslations("profile");
  const profile = useProfileStore(selectActiveProfile);
  const label = useProfileLabel(profile);
  const person = profilePersonName(profile);
  const section = useProfileSettingsStore((state) => state.section);
  const openAt = useProfileSettingsStore((state) => state.openAt);

  return (
    <aside className="flex min-h-0 flex-col gap-6 border-r bg-sidebar p-3">
      <div className="flex items-center gap-3 px-2 pt-2">
        <ProfileAvatar profile={profile} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{label}</span>
          {S.isNotEmpty(person) && (
            <span className="truncate text-xs text-muted-foreground">
              {person}
            </span>
          )}
        </div>
      </div>

      <nav aria-label={t("settings")} className="flex flex-col gap-1">
        {SECTIONS.map((item) => (
          <Button
            key={item.section}
            variant="ghost"
            aria-current={section === item.section ? "page" : undefined}
            className="justify-start aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium"
            onClick={() => openAt(item.section)}
          >
            <item.icon data-icon="inline-start" />
            {t(item.labelKey)}
          </Button>
        ))}
      </nav>
    </aside>
  );
}
