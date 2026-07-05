"use client";

import { Accordion } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumeStore } from "@/lib/store";
import { EditorSectionCertifications } from "./ed-section-certifications/ed-section-certifications";
import { EditorSectionEducation } from "./ed-section-education/ed-section-education";
import { EditorSectionExperience } from "./ed-section-experience/ed-section-experience";
import { EditorSectionLanguages } from "./ed-section-languages/ed-section-languages";
import { EditorSectionPersonal } from "./ed-section-personal/ed-section-personal";
import { EditorSectionSkills } from "./ed-section-skills/ed-section-skills";
import { EditorSectionSummary } from "./ed-section-summary/ed-section-summary";

const SKELETONS = [1, 2, 3, 4, 5, 6];

export function EditorSectionList() {
  const openStatus = useResumeStore((state) => state.openStatus);
  const open = useResumeStore((state) => state.open);

  if (!open) {
    if (openStatus === "missing") {
      return (
        <p className="px-4 py-8 text-sm text-muted-foreground">
          "Résumé not found."
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-3 px-4 divide-y">
        {SKELETONS.map((s) => (
          <div key={s} className="flex items-center gap-3 h-11 p-4">
            <Skeleton className="size-5" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="size-5 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  // Keyed by the open résumé so a load/switch remounts the forms — this is how
  // the uncontrolled rich-text editors pick up the loaded document.
  return (
    <Accordion key={open.id} multiple className="border-none">
      <EditorSectionPersonal />
      <EditorSectionSummary />
      <EditorSectionExperience />
      <EditorSectionEducation />
      <EditorSectionCertifications />
      <EditorSectionSkills />
      <EditorSectionLanguages />
    </Accordion>
  );
}
