import { Button } from "@lanjut/ui/components/button";
import { DialogFooter } from "@lanjut/ui/components/dialog";
import { useTranslations } from "use-intl";

interface EditorPasteActionsProps {
  /** A blank résumé has nothing to lose, so the paste fills it directly. */
  isBlank: boolean;
  ready: boolean;
  onReplace: () => void;
  onCreate: () => void;
}

export function EditorPasteActions(props: EditorPasteActionsProps) {
  const t = useTranslations("editor.paste");

  if (props.isBlank) {
    return (
      <DialogFooter>
        <Button type="button" disabled={!props.ready} onClick={props.onReplace}>
          {t("import")}
        </Button>
      </DialogFooter>
    );
  }

  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        disabled={!props.ready}
        onClick={props.onReplace}
      >
        {t("replace")}
      </Button>
      <Button type="button" disabled={!props.ready} onClick={props.onCreate}>
        {t("createNew")}
      </Button>
    </DialogFooter>
  );
}
