"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

interface EditorSectionVisibilityToggleProps {
  hidden: boolean;
  onToggle: () => void;
}

export function EditorSectionVisibilityToggle({
  hidden,
  onToggle,
}: EditorSectionVisibilityToggleProps) {
  const t = useTranslations("editor.chrome");
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
      aria-label={hidden ? t("showSection") : t("hideSection")}
      className="rounded p-1 text-muted-foreground/70 transition-colors hover:text-foreground"
    >
      <Icon className="size-5" />
    </div>
  );
}
