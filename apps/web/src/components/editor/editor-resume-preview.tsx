import { resolveTemplateId } from "@lanjut/resume/templates";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useMemo } from "react";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { useResumeStore } from "@/lib/store";
import { EditorPreviewSkeleton } from "./editor-preview-skeleton";
import { EditorResumeNotFound } from "./editor-resume-not-found";
import { ResumeDocument } from "./resume-document";
import { resumeToPreview } from "./resume-to-preview";

const ENTER_REDUCED = { opacity: 0 };
const ENTER_FROM = { opacity: 0, y: 32 };

/**
 * The paper preview, driven by the open résumé in the store. `EditorPanels`
 * owns loading the document (`useEditorResume`), so this only reads `open` and
 * projects it through the `resumeToPreview` adapter into the résumé's template.
 *
 * The paper is keyed by résumé id: entering a résumé (first load or switching
 * via the sidebar) animates it in, while in-place edits never remount it.
 */
export function EditorResumePreview() {
  const open = useResumeStore((state) => state.open);
  const openStatus = useResumeStore((state) => state.openStatus);
  const preview = useMemo(() => (open ? resumeToPreview(open) : null), [open]);
  const missing = openStatus === "missing";

  return (
    <AnimatePresence mode="wait">
      {missing && (
        <PreviewEnter key="missing">
          <EditorResumeNotFound />
        </PreviewEnter>
      )}
      {!missing && (!open || !preview) && (
        <PreviewFade key="skeleton">
          <EditorPreviewSkeleton />
        </PreviewFade>
      )}
      {!missing && open && preview && (
        <PreviewEnter key={open.id}>
          <PreviewContentReveal>
            <div data-template={resolveTemplateId(open.templateId)}>
              <ResumeDocument
                resume={preview}
                template={resolveTemplateId(open.templateId)}
              />
            </div>
          </PreviewContentReveal>
        </PreviewEnter>
      )}
    </AnimatePresence>
  );
}

function PreviewEnter(props: { children: ReactNode }) {
  const reduceMotion = useReducedMotionPreference();

  return (
    <motion.div
      initial={reduceMotion ? ENTER_REDUCED : ENTER_FROM}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        y: reduceMotion ? 0 : -12,
        transition: { duration: 0.12, ease: "easeIn" },
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 30,
        mass: 0.9,
        opacity: { duration: 0.25, ease: "easeOut" },
      }}
    >
      {props.children}
    </motion.div>
  );
}

/**
 * ResumeDocument paints unpaginated on mount, then reflows once its measurement
 * effects fire, a visible flicker if it happens mid-entrance. A blank sheet
 * (matching ResumePage's paper style) rides the slide instead, and the real
 * content fades in over it only after the entrance has settled.
 */
function PreviewContentReveal(props: { children: ReactNode }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 mx-auto aspect-210/297 w-full max-w-198.5 rounded border bg-white shadow-sm"
      />
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
      >
        {props.children}
      </motion.div>
    </div>
  );
}

function PreviewFade(props: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {props.children}
    </motion.div>
  );
}
