import { createProfile } from "@lanjut/resume";
import { cn } from "@lanjut/ui/lib/utils";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { NEW_PROFILE } from "@/hooks/use-selected-profile";
import {
  selectCanDeleteProfile,
  selectProfile,
  useProfileStore,
} from "@/lib/store";
import { ProfileBackup } from "./profile-backup";
import { ProfileDelete } from "./profile-delete";
import { ProfileDetailHeader } from "./profile-detail-header";
import { ProfileForm } from "./profile-form";
import { ProfileSettingsHeading } from "./profile-settings-heading";

const FRAME = "rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6";

interface ProfileDetailProps {
  /** A profile id, or `new` for a profile not saved yet. */
  selection: string;
  onSelect: (id: string) => void;
  /** Leaves the new-profile form without saving. */
  onCancelNew: () => void;
  /** A card on the page; plain inside a drawer, which is the card. */
  framed: boolean;
}

/** One profile's information to edit, or the form for a new profile. */
export function ProfileDetail(props: ProfileDetailProps) {
  if (props.selection === NEW_PROFILE) {
    return (
      <ProfileDetailNew
        framed={props.framed}
        onCreated={props.onSelect}
        onCancel={props.onCancelNew}
      />
    );
  }
  return <ProfileDetailSaved id={props.selection} framed={props.framed} />;
}

function ProfileDetailSaved(props: { id: string; framed: boolean }) {
  const t = useTranslations("profile");
  const profile = useProfileStore(selectProfile(props.id));
  const saveProfile = useProfileStore((state) => state.saveProfile);
  const canDelete = useProfileStore(selectCanDeleteProfile);

  return (
    <div className="flex flex-col gap-6">
      <section className={cn("flex flex-col gap-6", props.framed && FRAME)}>
        <div className="flex flex-col gap-4 border-b pb-6">
          <ProfileDetailHeader profile={profile} />
          <ProfileBackup key={`backup-${profile.id}`} profile={profile} />
        </div>
        <ProfileForm
          key={profile.id}
          profile={profile}
          submitLabel={t("save")}
          onSubmit={saveProfile}
        />
      </section>
      {canDelete && <ProfileDelete key={profile.id} profile={profile} />}
    </div>
  );
}

function ProfileDetailNew(props: {
  framed: boolean;
  onCreated: (id: string) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("profile");
  const [draft] = useState(() => createProfile(""));
  const addProfile = useProfileStore((state) => state.addProfile);

  return (
    <section className={cn("flex flex-col gap-6", props.framed && FRAME)}>
      <div className="border-b pb-6">
        <ProfileSettingsHeading
          title={t("newTitle")}
          description={t("newDescription")}
        />
      </div>
      <ProfileForm
        profile={draft}
        submitLabel={t("create")}
        onCancel={props.onCancel}
        onSubmit={async (profile) => {
          await addProfile(profile);
          props.onCreated(profile.id);
        }}
      />
    </section>
  );
}
