"use client";

import { useTranslations } from "next-intl";
import { EditorDocumentCopy } from "./editor-document-copy";
import { EditorDocumentDownload } from "./editor-document-download";
import { EditorDocumentIcon } from "./editor-document-icon";
import { EditorDocumentImport } from "./editor-document-import";
import { EditorDocumentLanguage } from "./editor-document-language";
import { EditorDocumentSpacing } from "./editor-document-spacing";

/** The Document tab: document-level actions (language, export, import). */
export function EditorDocumentPanel() {
  const t = useTranslations("editor.document");
  return (
    <div className="flex flex-col divide-y px-4">
      <section className="flex flex-col gap-3 py-4">
        <EditorDocumentLanguage />
        <EditorDocumentIcon />
        <EditorDocumentSpacing />
      </section>

      <section className="py-4">
        <h3 className="text-sm font-medium">{t("copyHeading")}</h3>
        <p className="mb-3 text-xs text-muted-foreground text-balance">
          {t("copyHint")}
        </p>
        <EditorDocumentCopy />
      </section>

      <section className="py-4">
        <h3 className="mb-3 text-sm font-medium">{t("downloadHeading")}</h3>
        <EditorDocumentDownload />
      </section>

      <section className="py-4">
        <h3 className="text-sm font-medium">{t("importHeading")}</h3>
        <p className="mb-3 text-xs text-muted-foreground text-balance">
          {t("importHint")}
        </p>
        <EditorDocumentImport />
      </section>
    </div>
  );
}
