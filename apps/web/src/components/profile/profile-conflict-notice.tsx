import { useTranslations } from "use-intl";
import { ConflictDialog } from "@/components/shared/conflict-dialog";
import { useProfileStore } from "@/lib/store";

/** Asks which version to keep when another window saved or deleted a profile first. */
export function ProfileConflictNotice() {
  const t = useTranslations("platform.grid");
  const conflict = useProfileStore((state) => state.conflict);
  const keepStoredProfile = useProfileStore((state) => state.keepStoredProfile);
  const saveProfileAsCopy = useProfileStore((state) => state.saveProfileAsCopy);
  const restoreProfile = useProfileStore((state) => state.restoreProfile);
  const closeDeletedProfile = useProfileStore(
    (state) => state.closeDeletedProfile,
  );
  const name = conflict?.profile.name ?? "";

  return (
    <ConflictDialog
      kind={conflict?.kind ?? null}
      item="profile"
      onKeepOther={() => void keepStoredProfile()}
      onSaveCopy={() => void saveProfileAsCopy(t("copyOf", { title: name }))}
      onRestore={() => void restoreProfile()}
      onClose={() => void closeDeletedProfile()}
    />
  );
}
