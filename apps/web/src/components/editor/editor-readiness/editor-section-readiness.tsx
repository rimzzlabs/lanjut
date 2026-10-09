import { sectionReadiness } from "@lanjut/resume/readiness";
import { CheckCircleIcon, CircleDashedIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useReadiness } from "./use-readiness";

/** A section row's mark: its readiness checks all pass, or some still fail. */
export function EditorSectionReadiness(props: { section: string }) {
  const readiness = useReadiness();
  const t = useTranslations("editor.readiness");
  if (!readiness) return null;
  const state = sectionReadiness(readiness, props.section);
  if (state === undefined) return null;

  if (state === "done") {
    return (
      <span className="-ml-1.5 inline-flex text-primary">
        <CheckCircleIcon weight="fill" className="size-3.5" />
        <span className="sr-only">{t("sectionDone")}</span>
      </span>
    );
  }
  return (
    <span className="-ml-1.5 inline-flex text-muted-foreground/70">
      <CircleDashedIcon className="size-3.5" />
      <span className="sr-only">{t("sectionTodo")}</span>
    </span>
  );
}
