import { Button } from "@lanjut/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@lanjut/ui/components/popover";
import { HardDriveIcon, WarningIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useResumeStore, useSaveStatusStore } from "@/lib/store";

/** Confirms each write of the open résumé to this device, and says so plainly when one fails. */
export function EditorSaveStatus() {
  const ready = useResumeStore((state) => state.openStatus === "ready");
  const status = useSaveStatusStore((state) => state.status);

  if (!ready) return null;
  if (status === "failed") return <EditorSaveFailed />;
  return <EditorSaveProgress saving={status === "saving"} />;
}

function EditorSaveProgress(props: { saving: boolean }) {
  const t = useTranslations("editor.saveStatus");

  return (
    <p className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
      <HardDriveIcon aria-hidden className="size-3.5 shrink-0" />
      <span
        key={String(props.saving)}
        className="animate-in fade-in-0 duration-150"
      >
        {props.saving ? t("saving") : <EditorSavedLabel />}
      </span>
    </p>
  );
}

function EditorSavedLabel() {
  const t = useTranslations("editor.saveStatus");

  return (
    <>
      <span className="sm:hidden">{t("savedShort")}</span>
      <span className="max-sm:hidden">{t("saved")}</span>
    </>
  );
}

function EditorSaveFailed() {
  const t = useTranslations("editor.saveStatus");

  return (
    <>
      <p role="alert" className="sr-only">
        {t("failedTitle")}
      </p>
      <Popover>
        <PopoverTrigger
          render={
            <Button size="sm" variant="destructive" className="shrink-0" />
          }
        >
          <WarningIcon weight="fill" />
          <span className="max-sm:sr-only">{t("failed")}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80">
          <PopoverHeader>
            <PopoverTitle>{t("failedTitle")}</PopoverTitle>
            <PopoverDescription>{t("failedBody")}</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </>
  );
}
