import type { RevisionError } from "@lanjut/resume/db";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lanjut/ui/components/alert-dialog";
import { useTranslations } from "use-intl";

export type ConflictItem = "resume" | "profile";

interface ConflictDialogProps {
  /** Why this window's save was refused, or null when nothing was. */
  kind: RevisionError | null;
  item: ConflictItem;
  /** Drops this window's version for the stored one. */
  onKeepOther: () => void;
  /** Saves this window's version as a new item. */
  onSaveCopy: () => void;
  /** Writes this window's version back after another window deleted it. */
  onRestore: () => void;
  /** Leaves an item that another window deleted. */
  onClose: () => void;
}

/**
 * Asks which version to keep when another window saved or deleted the same
 * résumé or profile first. It has no cancel: until the person picks, no save
 * of this window can land.
 */
export function ConflictDialog(props: ConflictDialogProps) {
  return (
    <AlertDialog open={props.kind !== null}>
      <AlertDialogContent>
        {props.kind === "changed" && <ConflictChanged {...props} />}
        {props.kind === "deleted" && <ConflictDeleted {...props} />}
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConflictChanged(props: ConflictDialogProps) {
  const t = useTranslations("conflict");

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {t("changedTitle", { item: props.item })}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {t("changedDescription")}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction variant="outline" onClick={props.onSaveCopy}>
          {t("saveCopy")}
        </AlertDialogAction>
        <AlertDialogAction onClick={props.onKeepOther}>
          {t("keepOther")}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

function ConflictDeleted(props: ConflictDialogProps) {
  const t = useTranslations("conflict");

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {t("deletedTitle", { item: props.item })}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {t("deletedDescription")}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction variant="outline" onClick={props.onClose}>
          {t("close")}
        </AlertDialogAction>
        <AlertDialogAction onClick={props.onRestore}>
          {t("restore")}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
