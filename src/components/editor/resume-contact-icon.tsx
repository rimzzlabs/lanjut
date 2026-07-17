"use client";

import { Globe, Link, Mail, MapPin, Phone } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ContactKind } from "./resume-preview";

const EASE = [0.22, 1, 0.36, 1] as const;

const CONTACT_ICON: Record<ContactKind, typeof Phone> = {
  phone: Phone,
  email: Mail,
  website: Globe,
  linkedin: Link,
  location: MapPin,
};

interface ResumeContactIconProps {
  kind: ContactKind;
  show: boolean;
  /** Which edge of the contact row the icon sits on. Defaults to "start". */
  edge?: "start" | "end";
  className?: string;
}

/**
 * Header contact glyph that grows in and collapses out as the document's
 * contact-icons toggle flips. The collapsed state also pulls back the row's
 * gap-2 with a negative margin, so the text closes up without a jump when
 * the element unmounts.
 */
export function ResumeContactIcon(props: ResumeContactIconProps) {
  const reduce = useReducedMotion();
  const Icon = CONTACT_ICON[props.kind];
  const collapsed =
    props.edge === "end"
      ? { width: 0, opacity: 0, marginLeft: "-0.5rem" }
      : { width: 0, opacity: 0, marginRight: "-0.5rem" };
  const expanded =
    props.edge === "end"
      ? { width: "0.875rem", opacity: 1, marginLeft: "0rem" }
      : { width: "0.875rem", opacity: 1, marginRight: "0rem" };

  return (
    <AnimatePresence initial={false} mode="wait">
      {props.show && (
        <motion.span
          key="icon"
          aria-hidden
          className={cn(
            "flex shrink-0 items-center overflow-hidden",
            props.className,
          )}
          initial={collapsed}
          animate={expanded}
          exit={collapsed}
          transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
        >
          <Icon className="size-3.5 shrink-0" />
        </motion.span>
      )}
    </AnimatePresence>
  );
}
