import type { TemplateId } from "@lanjut/resume/templates";
import { useRouter } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { useResumeStore } from "@/lib/store";

/**
 * Applies a template to a saved résumé and opens it in the editor. The résumé
 * opens first and the template lands as an edit, so Undo in the editor brings
 * the old template back.
 */
export function useApplyTemplate() {
  const router = useRouter();
  const openResume = useResumeStore((state) => state.openResume);
  const updateOpen = useResumeStore((state) => state.updateOpen);

  return async function applyTemplate(id: string, templateId: TemplateId) {
    await openResume(id);
    updateOpen((resume) => {
      if (resume.templateId === templateId) return resume;
      return { ...resume, templateId };
    });
    router.push(editorHref(id));
  };
}
