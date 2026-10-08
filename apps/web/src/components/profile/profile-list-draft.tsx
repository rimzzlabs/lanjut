import { PlusIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

/**
 * The profile being added, at the end of the list, marked as the one shown,
 * so the form beside it reads as a new profile and not the one it replaced.
 */
export function ProfileListDraft() {
  const t = useTranslations("profile");

  return (
    <div
      aria-current="true"
      className="flex w-full items-center gap-3 rounded-xl border border-dashed border-primary bg-primary/5 p-3 ring-1 ring-primary"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-primary/60 text-primary">
        <PlusIcon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{t("newTitle")}</span>
        <span className="truncate text-xs text-muted-foreground">
          {t("draftHint")}
        </span>
      </span>
    </div>
  );
}
