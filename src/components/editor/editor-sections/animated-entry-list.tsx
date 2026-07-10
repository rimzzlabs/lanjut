"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { forwardRef, type ReactNode, useImperativeHandle, useRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface AnimatedEntryListHandle {
  scrollToIndex: (index: number) => void;
}

interface AnimatedEntryListProps {
  ids: string[];
  renderItem: (id: string, index: number) => ReactNode;
}

export const AnimatedEntryList = forwardRef<
  AnimatedEntryListHandle,
  AnimatedEntryListProps
>(function AnimatedEntryList(props, ref) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex(index) {
        requestAnimationFrame(() => {
          const child = containerRef.current?.children[index];
          child?.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "nearest",
          });
        });
      },
    }),
    [reduce],
  );

  return (
    <div ref={containerRef} className="flex w-full flex-col gap-4">
      <AnimatePresence initial={false} mode="popLayout">
        {props.ids.map((id, index) => (
          <motion.div
            key={id}
            layout={reduce ? false : "position"}
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
            className="not-last:border-b not-last:pb-4"
          >
            {props.renderItem(id, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
