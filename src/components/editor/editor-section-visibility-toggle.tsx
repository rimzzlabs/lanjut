"use client";

import { Eye, EyeOff } from "lucide-react";

interface EditorSectionVisibilityToggleProps {
  hidden: boolean;
  onToggle: () => void;
}

export function EditorSectionVisibilityToggle({
  hidden,
  onToggle,
}: EditorSectionVisibilityToggleProps) {
  const Icon = hidden ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={hidden}
      aria-label={hidden ? "Show section" : "Hide section"}
      className="rounded p-1 text-muted-foreground/70 transition-colors hover:text-foreground"
    >
      <Icon className="size-5" />
    </button>
  );
}
