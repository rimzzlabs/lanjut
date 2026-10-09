import type { ProfileImportPlan } from "@lanjut/resume/backup/profile-import-plan";
import { Button } from "@lanjut/ui/components/button";
import { Spinner } from "@lanjut/ui/components/spinner";
import { R } from "@mobily/ts-belt";
import { TrayArrowUpIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { profileLabelOf } from "@/hooks/use-profile-label";
import {
  applyBackupImport,
  BACKUP_ACCEPT,
  type ProfileImportError,
  planBackupImport,
} from "./profile-backup-file";
import { ProfileImportDialog } from "./profile-import-dialog";

const ERROR_KEYS: Record<ProfileImportError, string> = {
  syntax: "importErrorInvalid",
  notBackup: "importErrorInvalid",
  invalid: "importErrorInvalid",
  resumeFile: "importErrorResume",
  newerVersion: "importErrorNewer",
  unreadable: "importErrorRead",
  tooLarge: "importErrorTooLarge",
};

/**
 * Importing a profile backup: pick the file, see what it changes, confirm.
 * `onImported` shows the profile once it is in.
 */
export function ProfileImport(props: { onImported: (id: string) => void }) {
  const t = useTranslations("profile");
  const inputRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState<ProfileImportPlan | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const result = await planBackupImport(file);
    setBusy(false);
    R.match(result, setPlan, (error) => toast.error(t(ERROR_KEYS[error])));
  }

  async function confirm(next: ProfileImportPlan) {
    setPlan(null);
    setBusy(true);
    try {
      await applyBackupImport(next);
      toast.success(
        t("importDone", { name: profileLabelOf(next.profile, t("guest")) }),
      );
      props.onImported(next.profile.id);
    } catch {
      toast.error(t("importErrorWrite"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={BACKUP_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          void onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <Button
        id="tour-import-profile"
        variant="outline"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <Spinner /> : <TrayArrowUpIcon />}
        {t("importProfile")}
      </Button>
      <ProfileImportDialog
        plan={plan}
        onCancel={() => setPlan(null)}
        onConfirm={(next) => void confirm(next)}
      />
    </>
  );
}
