import { templateHasContactIcons } from "@lanjut/resume/templates";
import { Switch } from "@lanjut/ui/components/switch";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";

export function EditorStylingIcons() {
  const templateId = useResumeStore((state) => state.open?.templateId);
  const showIcons = useResumeStore((state) => state.open?.showIcons ?? true);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");

  if (templateId === undefined) return null;

  const hasIcons = templateHasContactIcons(templateId);

  function handleChange(next: boolean) {
    updateOpen((resume) => ({ ...resume, showIcons: next }));
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
