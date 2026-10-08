import { useState } from "react";
import { useTranslations } from "use-intl";
import {
  draftFullName,
  draftHasContent,
  draftToResume,
} from "@/components/landing/landing-draft-resume";
import { useRouter } from "@/i18n/navigation";
import { EDITOR_PATHNAME, editorHref } from "@/lib/routes";
import { useLandingDraftStore, useResumeStore } from "@/lib/store";

/**
 * Turns the landing draft into a created résumé and opens it in the editor. An
 * untouched draft opens the dashboard's create dialog instead.
 */
export function useLandingDraftCreate() {
  const t = useTranslations("landing");
  const router = useRouter();
  const createResume = useResumeStore((state) => state.createResume);
  const [creating, setCreating] = useState(false);

  async function create() {
    const { draft, template } = useLandingDraftStore.getState();
    if (!draftHasContent(draft)) {
      router.push(`${EDITOR_PATHNAME}?create=true`);
      return;
    }
    setCreating(true);
    try {
      const resume = await createResume(
        draftFullName(draft) || t("draftTitle"),
        {
          source: "import",
          imported: { resume: draftToResume(draft), leftovers: [] },
          templateId: template,
        },
      );
      router.push(editorHref(resume.id));
    } finally {
      setCreating(false);
    }
  }

  return { create, creating };
}
