"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorSectionVisibilityToggle } from "./editor-section-visibility-toggle";
import type {
  EditorSectionDescriptor,
  EditorSectionId,
} from "./editor-sections";

interface EditorSectionListItemProps {
  section: EditorSectionDescriptor;
  active: boolean;
  hidden: boolean;
  onSelect: (id: EditorSectionId) => void;
  onToggleHidden: (id: EditorSectionId) => void;
}

export function EditorSectionListItem(props: EditorSectionListItemProps) {
  const Icon = props.section.icon;

  return (
    <li className="relative">
      <button
        type="button"
        onClick={() => props.onSelect(props.section.id)}
        className={cn(
          "flex w-full items-center gap-3 py-5 pr-16 text-left transition-colors",
          props.active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className="size-5 shrink-0 text-foreground" />
        <span className="flex-1 truncate text-lg">{props.section.label}</span>
      </button>

      {/* Overlays the row button; only the toggle re-enables pointer events, so
          taps on the chevron fall through to select the row. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-2">
        {!props.section.required && (
          <span className="pointer-events-auto">
            <EditorSectionVisibilityToggle
              hidden={props.hidden}
              onToggle={() => props.onToggleHidden(props.section.id)}
            />
          </span>
        )}
        <ChevronRight
          className={cn(
            "size-5 shrink-0",
            props.active ? "text-foreground" : "text-muted-foreground/50",
          )}
        />
      </div>
    </li>
  );
}
