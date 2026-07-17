"use client";

import { EditorSectionVisibilityToggle } from "@/components/editor/editor-section-visibility-toggle";
import type { SectionType } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface EditorSectionVisibilityProps {
  /** Locates the section: by id for custom sections, by type for core ones. */
  type?: SectionType;
  sectionId?: string;
  className?: string;
}

/**
 * The per-section visibility toggle, placed in the accordion trigger row just
 * left of the chevron. Like the custom-section menu, it sits absolutely
 * positioned beside the trigger (never nested inside the trigger button) so
 * toggling never expands or collapses the section.
 */
export function EditorSectionVisibility(props: EditorSectionVisibilityProps) {
  const section = useResumeStore((state) =>
    state.open?.sections.find((s) =>
      props.sectionId ? s.id === props.sectionId : s.type === props.type,
    ),
  );
  const toggleSectionVisibility = useResumeStore(
    (state) => state.toggleSectionVisibility,
  );
  if (!section) return null;
  return (
    <div className={cn("absolute top-3 right-10 z-10", props.className)}>
      <EditorSectionVisibilityToggle
        hidden={section.hidden ?? false}
        onToggle={() => toggleSectionVisibility(section.id)}
      />
    </div>
  );
}
