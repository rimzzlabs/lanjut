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
import { useTranslations } from "use-intl";
import { useEditorCodeStore } from "@/lib/store";

export function EditorCodeDiscard() {
  const t = useTranslations("editor.code");
  const pending = useEditorCodeStore((state) => state.pending);
  const setPending = useEditorCodeStore((state) => state.setPending);
  const setDraft = useEditorCodeStore((state) => state.setDraft);

  const onConfirm = () => {
    setPending(null);
    setDraft(null);
    pending?.();
  };

  return (
    <AlertDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) setPending(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("discardTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("discardDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t("discardCancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t("discardConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
