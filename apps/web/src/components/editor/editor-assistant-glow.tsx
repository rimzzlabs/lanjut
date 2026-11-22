import { AnimatePresence, motion } from "motion/react";
import { useOpenAssistantActivity } from "@/hooks/use-open-assistant-activity";
import { IS_DESKTOP } from "@/lib/build-target";

/**
 * A glow inside the edge of each page while an AI assistant works on the open
 * résumé, with the chip. It pulses while a call runs. It lies over the page
 * and takes no room, and the PDF never draws it.
 */
export function EditorAssistantGlow() {
  const activity = useOpenAssistantActivity();

  return (
    <AnimatePresence>
      {IS_DESKTOP && activity && (
        <motion.div
          key="glow"
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div
            data-busy={activity.busy > 0}
            className="size-full rounded shadow-[inset_0_0_0_2px_var(--color-primary),inset_0_0_40px_color-mix(in_oklab,var(--color-primary)_28%,transparent)] data-[busy=true]:animate-pulse motion-reduce:animate-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
