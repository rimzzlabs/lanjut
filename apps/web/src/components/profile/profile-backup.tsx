import type { Profile } from "@lanjut/resume";
import { Button } from "@lanjut/ui/components/button";
import { Spinner } from "@lanjut/ui/components/spinner";
import { D, O } from "@mobily/ts-belt";
import { DownloadSimpleIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { triggerDownload } from "@/components/editor/download-file";
import { useProfileLabel } from "@/hooks/use-profile-label";
import { useProfileResumeCounts } from "@/hooks/use-profile-resumes";
import { IS_DESKTOP } from "@/lib/build-target";
import { buildProfileBackup, shareableBackup } from "./profile-backup-file";

/**
 * Whether this browser can hand a file to the system share sheet. The Mac
 * app leaves Share out: its Download already opens a save dialog.
 */
function canShareFiles(): boolean {
  if (IS_DESKTOP || typeof navigator.canShare !== "function") return false;
  const probe = new File(["{}"], "probe.txt", { type: "text/plain" });
  return navigator.canShare({ files: [probe] });
}

function isCancel(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * Backing up a profile: one file with the profile and its résumés, to import
 * on another device. Where the system can share files (phones, Safari), Share
 * sends it through AirDrop, Nearby Share, a cloud app, or email.
 */
export function ProfileBackup(props: { profile: Profile }) {
  const t = useTranslations("profile");
  const label = useProfileLabel(props.profile);
  const counts = useProfileResumeCounts();
  const count = O.getWithDefault(D.get(counts, props.profile.id), 0);
  const [canShare] = useState(canShareFiles);
  const [busy, setBusy] = useState(false);
  const [shareFile, setShareFile] = useState<File | null>(null);

  // Share must run inside the click, and Safari drops a share that waits on
  // reading the résumés first, so the file is ready before the click.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `count` is a deliberate rebuild trigger; the file holds the profile's résumés.
  useEffect(() => {
    if (!canShare) return;
    let cancelled = false;
    void buildProfileBackup(props.profile, label).then((file) => {
      if (!cancelled) setShareFile(file);
    });
    return () => {
      cancelled = true;
    };
  }, [canShare, props.profile, label, count]);

  async function download() {
    setBusy(true);
    try {
      const file = await buildProfileBackup(props.profile, label);
      if (await triggerDownload(file, file.name)) {
        toast.success(t("backupSaved"));
      }
    } catch {
      toast.error(t("backupFailed"));
    } finally {
      setBusy(false);
    }
  }

  // A browser can still refuse a file it said it could share. The backup
  // then downloads, so the click still ends with the file in hand.
  async function share() {
    if (!shareFile) return;
    try {
      await navigator.share({
        files: [shareableBackup(shareFile)],
        title: label,
      });
    } catch (error) {
      // Closing the share sheet rejects with AbortError; that is no failure.
      if (isCancel(error)) return;
      if (await triggerDownload(shareFile, shareFile.name)) {
        toast.info(t("backupShareFallback"));
      }
    }
  }

  return (
    // The box sits in a column whose width does not follow the window, so it
    // lays out by its own width.
    <div
      id="tour-profile-backup"
      className="@container/backup rounded-lg bg-muted/50 p-4"
    >
      <div className="flex flex-col gap-3 @md/backup:flex-row @md/backup:items-center @md/backup:justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{t("backupTitle")}</span>
          <span className="text-sm text-muted-foreground">
            {t("backupDescription", { count })}
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          {canShare && (
            <Button
              variant="outline"
              disabled={shareFile === null}
              onClick={() => void share()}
            >
              <ShareNetworkIcon data-icon="inline-start" />
              {t("backupShare")}
            </Button>
          )}
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void download()}
          >
            {busy ? <Spinner /> : <DownloadSimpleIcon />}
            {t("backupDownload")}
          </Button>
        </div>
      </div>
    </div>
  );
}
