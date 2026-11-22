import { Button } from "@lanjut/ui/components/button";
import { useTranslations } from "use-intl";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/shared/responsive-dialog";

/** What the assistant gets, and where the text goes, said before the switch turns on. */
const FACT_KEYS = [
  "factReads",
  "factCloud",
  "factPhoto",
  "factUndo",
  "factOff",
] as const;

interface ProfileAssistantEnableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ProfileAssistantEnableDialog(
  props: ProfileAssistantEnableDialogProps,
) {
  const t = useTranslations("profile.assistant");

  return (
    <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent showCloseButton={false}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("confirmTitle")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t("confirmDescription")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
          {FACT_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
        <ResponsiveDialogFooter className="mt-2">
          <ResponsiveDialogClose type="button" variant="outline">
            {t("cancel")}
          </ResponsiveDialogClose>
          <Button type="button" onClick={props.onConfirm}>
            {t("confirm")}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
