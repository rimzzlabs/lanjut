"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { SortableList } from "@/components/shared/sortable-list";
import { Accordion } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { isReorderableSection, type SectionType } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { EditorSectionCertifications } from "./ed-section-certifications/ed-section-certifications";
import { EditorSectionCustom } from "./ed-section-custom/ed-section-custom";
import { EditorSectionCustomAdd } from "./ed-section-custom/ed-section-custom-add";
import { EditorSectionEducation } from "./ed-section-education/ed-section-education";
import { EditorSectionExperience } from "./ed-section-experience/ed-section-experience";
import { EditorSectionInternship } from "./ed-section-internship/ed-section-internship";
import { EditorSectionLanguages } from "./ed-section-languages/ed-section-languages";
import { EditorSectionOrganizations } from "./ed-section-organizations/ed-section-organizations";
import { EditorSectionPersonal } from "./ed-section-personal/ed-section-personal";
import { EditorSectionProjects } from "./ed-section-projects/ed-section-projects";
import { EditorSectionSkills } from "./ed-section-skills/ed-section-skills";
import { EditorSectionSummary } from "./ed-section-summary/ed-section-summary";
import {
  EditorSectionSortableItem,
  SECTION_TRIGGER_INSET,
} from "./editor-section-sortable-item";

const SKELETONS = [1, 2, 3, 4, 5, 6, 7];

/** Maps each reorderable section type to its accordion editor. */
const SECTION_EDITORS: Partial<Record<SectionType, () => ReactNode>> = {
  experience: EditorSectionExperience,
  internship: EditorSectionInternship,
  projects: EditorSectionProjects,
  organizations: EditorSectionOrganizations,
  education: EditorSectionEducation,
  certifications: EditorSectionCertifications,
  skills: EditorSectionSkills,
  languages: EditorSectionLanguages,
};

export function EditorSectionList() {
  const openStatus = useResumeStore((state) => state.openStatus);
  const open = useResumeStore((state) => state.open);
  const reorderSections = useResumeStore((state) => state.reorderSections);
  const t = useTranslations("editor.chrome");

  // Controlled accordion open-state. Item values are the section id for custom
  // sections (so a newly added one can be opened by id) and base-ui-generated
  // ids for the rest. Stale ids from another résumé simply match nothing.
  const [openSections, setOpenSections] = useState<string[]>([]);

  if (!open) {
    if (openStatus === "missing") {
      return (
        <p className="px-4 py-8 text-sm text-muted-foreground">
          {t("notFound")}
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

  const reorderable = open.sections.filter((section) =>
    isReorderableSection(section.type),
  );

  // Keyed by the open résumé so a load/switch remounts the forms; this is how
  // the uncontrolled rich-text editors pick up the loaded document. Personal
  // Details (the Header) and Summary are pinned; the rest drag to reorder.
  return (
    <>
      <Accordion
        key={open.id}
        multiple
        value={openSections}
        onValueChange={setOpenSections}
        className="border-none"
      >
        <div className={cn("not-last:border-b", SECTION_TRIGGER_INSET)}>
          <EditorSectionPersonal />
        </div>
        <div className={cn("not-last:border-b", SECTION_TRIGGER_INSET)}>
          <EditorSectionSummary />
        </div>
        <SortableList
          items={reorderable.map((section) => section.id)}
          onReorder={reorderSections}
          remeasureWhileDragging
        >
          {reorderable.map((section) => {
            const Editor = SECTION_EDITORS[section.type];
            const content =
              section.type === "custom" ? (
                <EditorSectionCustom sectionId={section.id} />
              ) : Editor ? (
                <Editor />
              ) : null;
            if (!content) return null;
            return (
              <EditorSectionSortableItem
                key={section.id}
                id={section.id}
                handleLabel={t("reorderSection")}
              >
                {content}
              </EditorSectionSortableItem>
            );
          })}
        </SortableList>
      </Accordion>

      <EditorSectionCustomAdd
        onAdded={(id) => setOpenSections((prev) => [...prev, id])}
      />
    </>
  );
}
