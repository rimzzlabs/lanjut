import type { ProfileImportPlan } from "@lanjut/resume/backup/profile-import-plan";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lanjut/ui/components/alert-dialog";
import { A } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { profileLabelOf } from "@/hooks/use-profile-label";

const PROFILE_LINE = {
  add: "importProfileAdd",
  same: "importProfileSame",
  update: "importProfileUpdate",
  keep: "importProfileKeep",
} as const;

interface ProfileImportDialogProps {
  plan: ProfileImportPlan | null;
  onCancel: () => void;
  onConfirm: (plan: ProfileImportPlan) => void;
}

/** What a backup file will change, before anything changes. */
export function ProfileImportDialog(props: ProfileImportDialogProps) {
  const t = useTranslations("profile");
  const { plan } = props;

  return (
    <AlertDialog
      open={plan !== null}
      onOpenChange={(open) => {
        if (!open) props.onCancel();
      }}
    >
      {plan && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("importTitle", {
                name: profileLabelOf(plan.profile, t("guest")),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(PROFILE_LINE[plan.profileAction])}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 rounded-lg bg-muted/50 p-3 text-sm">
            <dt className="text-muted-foreground">{t("importNew")}</dt>
            <dd className="font-medium tabular-nums">{A.length(plan.add)}</dd>
            <dt className="text-muted-foreground">{t("importNewer")}</dt>
            <dd className="font-medium tabular-nums">
              {A.length(plan.update)}
            </dd>
            <dt className="text-muted-foreground">{t("importSame")}</dt>
            <dd className="font-medium tabular-nums">{plan.keep}</dd>
          </dl>
          <p className="text-sm text-muted-foreground">{t("importNote")}</p>

          <AlertDialogFooter>
            <AlertDialogCancel>{t("importCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => props.onConfirm(plan)}>
              {t("importConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
