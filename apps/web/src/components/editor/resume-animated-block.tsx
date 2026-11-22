import { motion } from "motion/react";
import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A block marked for a moment, such as a part that an assistant changed. */
export interface BlockMark {
  /** The change that marks it. */
  seq: number;
  /** Scrolls the block into view: the first marked block does. */
  reveal: boolean;
}

interface ResumeAnimatedBlockProps {
  layoutDependency: string;
  style?: CSSProperties;
  mark?: BlockMark;
  children: ReactNode;
}

const ENTER_FROM = { opacity: 0, y: 8 };

/**
 * Animates a preview block entering, leaving, and shifting as sections are
 * shown, hidden, added, or removed. `layoutDependency` is the page's block-id
 * signature, so position FLIPs only run when the set of blocks changes and
 * never while typing merely reflows content within existing blocks.
 *
 * A mark tints the block and the room around it with a shadow, so it changes
 * no size and the paginator measures the same page.
 */
export function ResumeAnimatedBlock(props: ResumeAnimatedBlockProps) {
  const reduce = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const revealSeq = props.mark?.reveal ? props.mark.seq : undefined;

  useEffect(() => {
    if (revealSeq === undefined) return;
    ref.current?.scrollIntoView({
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [revealSeq, reduce]);

  return (
    <motion.div
      ref={ref}
      layout={reduce ? false : "position"}
      layoutDependency={props.layoutDependency}
      initial={reduce ? false : ENTER_FROM}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        y: 8,
        opacity: 0,
        transition: { duration: reduce ? 0 : 0.18, ease: "easeIn" },
      }}
      transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
      data-marked={props.mark ? true : undefined}
      className="rounded-sm transition-[background-color,box-shadow] duration-700 data-marked:bg-primary/12 data-marked:shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-primary)_12%,transparent)] motion-reduce:transition-none"
      style={props.style}
    >
      {props.children}
    </motion.div>
  );
}
