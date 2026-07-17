"use client";

import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resumeToJson, resumeToYaml } from "@/lib/interchange";
import { useResumeStore } from "@/lib/store";

/** Copy the open document to the clipboard in an interchange format. */
export function EditorDocumentCopy() {
  const open = useResumeStore((state) => state.open);
  const t = useTranslations("editor.document");
  if (!open) return null;

  const copy = async (serialize: () => string) => {
    try {
      await navigator.clipboard.writeText(serialize());
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={() => void copy(() => resumeToJson(open))}
      >
        <Copy />
        <span className="sr-only">{t("copyJson")}</span>
        <span aria-hidden="true">JSON</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={() => void copy(() => resumeToYaml(open))}
      >
        <Copy />
        <span className="sr-only">{t("copyYaml")}</span>
        <span aria-hidden="true">YAML</span>
      </Button>
    </div>
  );
}
