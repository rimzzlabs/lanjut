"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EditorSectionSortableItemProps {
  id: string;
  handleLabel: string;
  children: ReactNode;
}

/**
 * Left-gutter inset applied to a section's accordion trigger so its content
 * clears the drag grip. Shared with the pinned (non-draggable) sections, which
 * carry the same inset but no grip, so every row's icon and title line up. The
 * inset targets the trigger content only, keeping the row background full-bleed.
 */
export const SECTION_TRIGGER_INSET = "[&_[data-slot=accordion-trigger]]:pl-10";

/**
 * Wraps a reorderable section's accordion item with drag behavior. The grip sits
 * in the trigger's left gutter (revealed on row hover or keyboard focus) and is
 * absolutely positioned so it never shifts layout.
 */
export function EditorSectionSortableItem(
  props: EditorSectionSortableItemProps,
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group/section relative not-last:border-b",
        SECTION_TRIGGER_INSET,
        // Collapse the dragged row to just its header so it stays compact in
        // flight and drop targets are easy to hit; the panel springs back on
        // drop since the accordion's open state is never touched.
        isDragging && "z-10 opacity-70 **:data-[slot=accordion-content]:hidden",
      )}
    >
      <button
        type="button"
        aria-label={props.handleLabel}
        className={cn(
          "absolute top-3.5 left-2 z-10 flex size-6 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/60 opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing group-hover/section:opacity-100",
          isDragging && "opacity-100",
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      {props.children}
    </div>
  );
}
