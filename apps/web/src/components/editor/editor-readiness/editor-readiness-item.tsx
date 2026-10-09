import {
  BULLETS_MIN,
  type ReadinessCheck,
  type ReadinessCheckId,
  type ReadinessTarget,
  SKILLS_MIN,
  SUMMARY_MIN_WORDS,
} from "@lanjut/resume/readiness";
import { Button } from "@lanjut/ui/components/button";
import { cn } from "@lanjut/ui/lib/utils";
import { CheckCircleIcon, CircleDashedIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

const MINIMUMS: Partial<Record<ReadinessCheckId, number>> = {
  summary: SUMMARY_MIN_WORDS,
  bullets: BULLETS_MIN,
  skills: SKILLS_MIN,
};

interface EditorReadinessItemProps {
  check: ReadinessCheck;
  onJump: (target: ReadinessTarget) => void;
}

export function EditorReadinessItem(props: EditorReadinessItemProps) {
  const { check, onJump } = props;
  const t = useTranslations("editor.readiness");

  return (
    <Button
      variant="ghost"
      className="h-auto w-full justify-start gap-2.5 px-2 py-1.5 text-left font-normal whitespace-normal"
      onClick={() => onJump(check.target)}
    >
      {check.done ? (
        <CheckCircleIcon weight="fill" className="text-primary" />
      ) : (
        <CircleDashedIcon className="text-muted-foreground" />
      )}
      <span className={cn(check.done && "text-muted-foreground")}>
        {t(`checks.${check.id}`, { min: MINIMUMS[check.id] ?? 0 })}
      </span>
      <span className="sr-only">{check.done ? t("done") : t("todo")}</span>
    </Button>
  );
}
