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
    // biome-ignore lint/a11y/useKeyWithClickEvents: ignore
    // biome-ignore lint/a11y/useSemanticElements: ignore
    <div
      role="button"
      tabIndex={0}
      aria-roledescription="Toggle"
      onClick={onToggle}
      aria-pressed={hidden}
      aria-label={hidden ? "Show section" : "Hide section"}
      className="rounded p-1 text-muted-foreground/70 transition-colors hover:text-foreground"
    >
      <Icon className="size-5" />
    </div>
  );
}
