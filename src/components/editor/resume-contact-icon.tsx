import {
  ArrowSquareOutIcon,
  EnvelopeSimpleIcon,
  GlobeIcon,
  LinkIcon,
  MapPinIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { cn } from "@/lib/utils";
import type { ContactKind } from "./resume-preview";

const EASE = [0.22, 1, 0.36, 1] as const;

const CONTACT_ICON: Record<ContactKind, typeof PhoneIcon> = {
  phone: PhoneIcon,
  email: EnvelopeSimpleIcon,
  website: GlobeIcon,
  linkedin: LinkIcon,
  link: ArrowSquareOutIcon,
  location: MapPinIcon,
};

type IconEdge = "start" | "end";

// The collapsed icon pulls back the row's gap-2 on the side that faces the text.
const COLLAPSED: Record<IconEdge, Record<string, number | string>> = {
  start: { width: 0, opacity: 0, marginRight: "-0.5rem" },
  end: { width: 0, opacity: 0, marginLeft: "-0.5rem" },
};

const EXPANDED: Record<IconEdge, Record<string, number | string>> = {
  start: { width: "0.875rem", opacity: 1, marginRight: "0rem" },
  end: { width: "0.875rem", opacity: 1, marginLeft: "0rem" },
};

interface ResumeContactIconProps {
  kind: ContactKind;
  show: boolean;
  /** Which edge of the contact row the icon sits on. Defaults to "start". */
  edge?: IconEdge;
  className?: string;
}

/**
 * Header contact glyph that grows in and collapses out as the document's
 * contact-icons toggle flips. The collapsed state also pulls back the row's
 * gap-2 with a negative margin, so the text closes up without a jump when
 * the element unmounts.
 */
export function ResumeContactIcon(props: ResumeContactIconProps) {
  const reduce = useReducedMotionPreference();
  const Icon = CONTACT_ICON[props.kind];
  const edge = props.edge ?? "start";
  const collapsed = COLLAPSED[edge];
  const expanded = EXPANDED[edge];

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
