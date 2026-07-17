"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { useResumeStore } from "@/lib/store";
import { templateHasContactIcons } from "@/lib/templates";

export function EditorDocumentIcon() {
  const templateId = useResumeStore((state) => state.open?.templateId);
  const showIcons = useResumeStore((state) => state.open?.showIcons ?? true);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");

  if (templateId === undefined) return null;

  const hasIcons = templateHasContactIcons(templateId);

  function handleChange(next: boolean) {
    updateOpen((draft) => {
      draft.showIcons = next;
    });
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span id="document-icons-label" className="text-sm text-muted-foreground">
        {t("documentIcons")}
      </span>
      <Switch
        aria-labelledby="document-icons-label"
        checked={hasIcons && showIcons}
        disabled={!hasIcons}
        onCheckedChange={handleChange}
      />
    </div>
  );
}
