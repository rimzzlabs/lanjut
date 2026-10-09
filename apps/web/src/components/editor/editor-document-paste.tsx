import { Button } from "@lanjut/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lanjut/ui/components/dialog";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { cn } from "@lanjut/ui/lib/utils";
import { ClipboardTextIcon } from "@phosphor-icons/react";
import { lazy, Suspense, useState } from "react";
import { useTranslations } from "use-intl";
import { PASTE_BOX_HEIGHT } from "./editor-paste/paste-box";

// The parsers load on intent or when the dialog opens.
function preloadPasteForm() {
  return import("./editor-paste/editor-paste-form");
}

function loadPasteForm() {
  return preloadPasteForm().then((module) => ({
    default: module.EditorPasteForm,
  }));
}

const LazyPasteForm = lazy(loadPasteForm);

/** Opens the dialog that imports JSON or YAML from pasted text. */
export function EditorDocumentPaste() {
  const t = useTranslations("editor.paste");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onPointerEnter={() => void preloadPasteForm()}
            onFocus={() => void preloadPasteForm()}
          />
        }
      >
        <ClipboardTextIcon />
        {t("open")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <Skeleton className={cn(PASTE_BOX_HEIGHT, "w-full rounded-md")} />
          }
        >
          <LazyPasteForm onDone={() => setOpen(false)} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
