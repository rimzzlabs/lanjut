"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ResumeAnimatedBlockProps {
  layoutDependency: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Animates a preview block entering, leaving, and shifting as sections are
 * shown, hidden, added, or removed. `layoutDependency` is the page's block-id
 * signature, so position FLIPs only run when the set of blocks changes and
 * never while typing merely reflows content within existing blocks.
 */
export function ResumeAnimatedBlock(props: ResumeAnimatedBlockProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      layout={reduce ? false : "position"}
      layoutDependency={props.layoutDependency}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        y: 8,
        opacity: 0,
        transition: { duration: reduce ? 0 : 0.18, ease: "easeIn" },
      }}
      transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
      style={props.style}
    >
      {props.children}
    </motion.div>
  );
}
