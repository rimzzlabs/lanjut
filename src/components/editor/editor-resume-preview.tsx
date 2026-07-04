"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useMemo } from "react";
import { useResumeStore } from "@/lib/store";
import { resolveTemplateId } from "@/lib/templates";
import { ResumeDocument } from "./resume-document";
import { resumeToPreview } from "./resume-to-preview";

/**
 * The paper preview, driven by the open résumé in the store. The editor sidebar
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

  return (
    <AnimatePresence mode="wait">
      {openStatus === "missing" ? (
        <PreviewEnter key="missing">
          <PreviewMessage>Résumé not found.</PreviewMessage>
        </PreviewEnter>
      ) : !open || !preview ? (
        <PreviewFade key="skeleton">
          <PreviewSkeleton />
        </PreviewFade>
      ) : (
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
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
 * effects fire — a visible flicker if it happens mid-entrance. A blank sheet
 * (matching ResumePage's paper style) rides the slide instead, and the real
 * content fades in over it only after the entrance has settled.
 */
function PreviewContentReveal(props: { children: ReactNode }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 mx-auto aspect-210/297 w-full max-w-[794px] rounded border bg-white shadow-sm"
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

function PreviewSkeleton() {
  return (
    <div className="mx-auto aspect-210/297 w-full max-w-[794px] animate-pulse rounded border bg-white shadow-sm" />
  );
}

function PreviewMessage(props: { children: string }) {
  return (
    <div className="mx-auto flex aspect-210/297 w-full max-w-[794px] items-center justify-center rounded border bg-white text-sm text-muted-foreground shadow-sm">
      {props.children}
    </div>
  );
}
