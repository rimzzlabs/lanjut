import { SealCheckIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useTranslations } from "use-intl";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";

const ENTER = { opacity: 0, y: 4 };

/** "60% ready", and "Ready to send" once every check passes. */
export function EditorReadinessLabel(props: { percent: number }) {
  const t = useTranslations("editor.readiness");
  const reduceMotion = useReducedMotionPreference();
  const ready = props.percent === 100;

  return (
    <motion.span
      key={ready ? "ready" : "progress"}
      initial={reduceMotion ? false : ENTER}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-1.5"
    >
      {ready && <SealCheckIcon weight="fill" className="text-primary" />}
      {ready ? t("ready") : t("percent", { percent: props.percent })}
    </motion.span>
  );
}
