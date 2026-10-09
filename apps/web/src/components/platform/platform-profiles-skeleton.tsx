import { Button } from "@lanjut/ui/components/button";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { PlusIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { ProfileList } from "@/components/profile/profile-list";
import { useSelectedProfile } from "@/hooks/use-selected-profile";
import { useProfileStore } from "@/lib/store";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";

const ROW_KEYS = ["a", "b"];

/**
 * The profiles page while its code loads. The header, its action, and the
 * line under it are real; the action waits, disabled, for the page.
 */
export function PlatformProfilesSkeleton() {
  const t = useTranslations("profile");

  return (
    <PlatformPageScroll>
      <PlatformPageHeader title={t("profiles")}>
        <Button disabled>
          <PlusIcon data-icon="inline-start" />
          {t("addProfile")}
        </Button>
      </PlatformPageHeader>
      <p className="-mt-2 max-w-prose text-sm text-muted-foreground">
        {t("newDescription")}
      </p>
      <PlatformProfilesBodySkeleton />
    </PlatformPageScroll>
  );
}

/**
 * The list and the profile card while they load. The navbar reads the
 * profiles early, so the list is often real already; the card waits in the
 * shape of the form it becomes.
 */
export function PlatformProfilesBodySkeleton() {
  const status = useProfileStore((state) => state.status);
  const profiles = useProfileStore((state) => state.profiles);
  const activeId = useProfileStore((state) => state.activeId);
  const [selection, setSelection] = useSelectedProfile();
  const ready = status === "ready";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      {ready && (
        <ProfileList
          profiles={profiles}
          activeId={activeId}
          selectedId={selection || activeId}
          onOpen={(id) => void setSelection(id)}
          draft={false}
        />
      )}
      {!ready && <ProfileListSkeleton />}
      <ProfileCardSkeleton />
    </div>
  );
}

function ProfileListSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {ROW_KEYS.map((key) => (
        <li
          key={key}
          className="flex items-center gap-3 rounded-xl border bg-card p-3"
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-xl bg-card p-4 ring-1 ring-foreground/10 max-lg:hidden sm:p-6">
      <div className="flex items-center gap-4 border-b pb-6">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="mr-auto flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <FieldSkeleton />
      <div className="flex items-center gap-3">
        <Skeleton className="size-14 rounded-full" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <FieldSkeleton />
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
    </div>
  );
}

/** A label over a 36px input, as each profile field is. */
function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
