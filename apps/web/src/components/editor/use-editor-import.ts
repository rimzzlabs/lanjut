import type { ResumeLanguage } from "@lanjut/resume";
import type { ParseResult } from "@lanjut/resume/import";
import { useLocale } from "use-intl";
import { useRouter } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { useResumeStore } from "@/lib/store";
import { isResumePreviewEmpty, resumeToPreview } from "./resume-to-preview";

/**
 * The two ways an import lands in the editor: in place of the open résumé,
 * or as a new résumé that the editor then opens. `isBlank` says whether the
 * open résumé has anything to lose, so a blank one can be filled without
 * asking.
 */
export function useEditorImport() {
  const open = useResumeStore((state) => state.open);
  const replace = useResumeStore((state) => state.replaceOpenWithImport);
  const createResume = useResumeStore((state) => state.createResume);
  const router = useRouter();
  const locale = useLocale();

  const isBlank = open ? isResumePreviewEmpty(resumeToPreview(open)) : true;

  async function createFromImport(imported: ParseResult, title: string) {
    if (!open) return;
    const resume = await createResume(title, {
      source: "import",
      imported,
      templateId: open.templateId,
      language: locale as ResumeLanguage,
    });
    router.push(editorHref(resume.id));
  }

  return { isBlank, replace, createFromImport };
}
