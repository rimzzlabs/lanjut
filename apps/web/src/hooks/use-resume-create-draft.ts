import type { ResumeLanguage } from "@lanjut/resume";
import type { ParseResult } from "@lanjut/resume/import";
import { useMemo } from "react";
import { useLocale } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import type { ResumeSource } from "@/lib/forms/resume";
import { selectActiveProfile, useProfileStore } from "@/lib/store";
import { buildNewResume } from "@/lib/store/new-resume";

/**
 * The résumé the create flow will save, as a preview, or null while an import
 * has no parsed file yet. The active profile fills a sample or blank start. It leaves the template out, so switching templates
 * restyles the same blocks instead of rebuilding them.
 */
export function useResumeCreateDraft(
  source: ResumeSource,
  imported: ParseResult | null,
): ResumePreview | null {
  const locale = useLocale();
  const profile = useProfileStore(selectActiveProfile);

  return useMemo(() => {
    if (source === "import" && !imported) return null;
    return resumeToPreview(
      buildNewResume("", {
        source,
        imported: imported ?? undefined,
        language: locale as ResumeLanguage,
        profile,
      }),
    );
  }, [source, imported, locale, profile]);
}
