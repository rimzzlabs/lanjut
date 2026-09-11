"use client";

import { FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEditorId } from "@/hooks/use-editor-id";
import { Link } from "@/i18n/navigation";
import { nearestResumeById } from "@/lib/resume";
import { editorHref } from "@/lib/routes";
import { useResumeStore } from "@/lib/store";

/**
 * The editor's missing-résumé state. When the id in the URL doesn't resolve,
 * the library index is searched for the closest id within edit tolerance, a
 * "did you mean" for mangled or truncated links. Deleted résumés (no near id)
 * fall back to the plain message.
 */
export function EditorResumeNotFound() {
  const id = useEditorId();
  const index = useResumeStore((state) => state.index);
  const suggestion = nearestResumeById(index, id ?? "");
  const t = useTranslations("editor.chrome");

  return (
    <div className="mx-auto flex aspect-210/297 w-full max-w-[794px] flex-col items-center justify-center gap-1.5 rounded border bg-white text-sm text-neutral-600 shadow-sm">
      <div className="mb-2 flex size-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500">
        <FileQuestion className="size-5" />
      </div>

      <p className="font-medium text-neutral-950">{t("notFound")}</p>

      {suggestion ? (
        <p>
          {t("didYouMean")}{" "}
          <Link
            href={editorHref(suggestion.id)}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {suggestion.title}
          </Link>
          ?
        </p>
      ) : (
        <p>{t("notExist")}</p>
      )}

      <p className="text-xs text-neutral-500">
        {t("headTo")}{" "}
        <Link
          href="/platform"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("dashboard")}
        </Link>{" "}
        {t("or")}{" "}
        <Link
          href="/platform/template"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("browseTemplates")}
        </Link>
      </p>
    </div>
  );
}
