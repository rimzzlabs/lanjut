import { Button } from "@lanjut/ui/components/button";
import { A } from "@mobily/ts-belt";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { ProfileDetail } from "@/components/profile/profile-detail";
import { ProfileDetailDrawer } from "@/components/profile/profile-detail-drawer";
import { ProfileList } from "@/components/profile/profile-list";
import { useHydrateProfiles } from "@/hooks/use-hydrate-profiles";
import { useHydrateResumeLibrary } from "@/hooks/use-hydrate-resume-library";
import { MEDIA_LG, useMediaQuery } from "@/hooks/use-media-query";
import { NEW_PROFILE, useSelectedProfile } from "@/hooks/use-selected-profile";
import { useProfileStore } from "@/lib/store";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";
import { PlatformProfilesBodySkeleton } from "./platform-profiles-skeleton";

/**
 * The profiles, shown at `/profile`. From `lg` the list sits beside the chosen
 * profile's information. Below `lg` a row opens it in a drawer.
 */
export function PlatformProfiles() {
  useHydrateProfiles();
  useHydrateResumeLibrary();
  const t = useTranslations("profile");
  const wide = useMediaQuery(MEDIA_LG);
  const status = useProfileStore((state) => state.status);
  const [selection, setSelection] = useSelectedProfile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function open(id: string) {
    void setSelection(id);
    if (!wide) setDrawerOpen(true);
  }

  return (
    <PlatformPageScroll>
      <PlatformPageHeader title={t("profiles")}>
        <Button onClick={() => open(NEW_PROFILE)}>
          <PlusIcon data-icon="inline-start" />
          {t("addProfile")}
        </Button>
      </PlatformPageHeader>
      <p className="-mt-2 max-w-prose text-sm text-muted-foreground">
        {t("newDescription")}
      </p>

      {status !== "ready" && <PlatformProfilesBodySkeleton />}
      {status === "ready" && (
        <PlatformProfilesBody
          wide={Boolean(wide)}
          selection={selection}
          onOpen={open}
          onSelect={(id) => void setSelection(id)}
          drawerOpen={drawerOpen}
          onDrawerOpenChange={setDrawerOpen}
        />
      )}
    </PlatformPageScroll>
  );
}

interface PlatformProfilesBodyProps {
  wide: boolean;
  selection: string;
  onOpen: (id: string) => void;
  onSelect: (id: string) => void;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
}

function PlatformProfilesBody(props: PlatformProfilesBodyProps) {
  const profiles = useProfileStore((state) => state.profiles);
  const activeId = useProfileStore((state) => state.activeId);
  const known =
    props.selection === NEW_PROFILE ||
    A.some(profiles, (profile) => profile.id === props.selection);
  const selected = known ? props.selection : activeId;

  if (!props.wide) {
    return (
      <>
        <ProfileList
          profiles={profiles}
          activeId={activeId}
          selectedId=""
          onOpen={props.onOpen}
          draft={false}
        />
        <ProfileDetailDrawer
          open={props.drawerOpen}
          onOpenChange={props.onDrawerOpenChange}
          selection={selected}
          onSelect={props.onSelect}
        />
      </>
    );
  }

  return (
    <div className="grid grid-cols-[20rem_minmax(0,1fr)] items-start gap-6">
      <div className="sticky top-6">
        <ProfileList
          profiles={profiles}
          activeId={activeId}
          selectedId={selected}
          onOpen={props.onOpen}
          draft={selected === NEW_PROFILE}
        />
      </div>
      <ProfileDetail
        selection={selected}
        onSelect={props.onSelect}
        onCancelNew={() => props.onSelect("")}
        framed
      />
    </div>
  );
}
