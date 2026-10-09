import {
  isReorderableSection,
  type Section,
  type SectionType,
} from "@lanjut/resume";
import { Accordion } from "@lanjut/ui/components/accordion";
import { cn } from "@lanjut/ui/lib/utils";
import { A } from "@mobily/ts-belt";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { SortableList } from "@/components/shared/sortable-list";
import { useEditorChromeStore, useResumeStore } from "@/lib/store";
import { preloadRichTextEditor } from "../rich-text/rich-text-field";
import { EditorSectionCertifications } from "./ed-section-certifications/ed-section-certifications";
import { EditorSectionCustom } from "./ed-section-custom/ed-section-custom";
import { EditorSectionCustomAdd } from "./ed-section-custom/ed-section-custom-add";
import { EditorSectionEducation } from "./ed-section-education/ed-section-education";
import { EditorSectionExperience } from "./ed-section-experience/ed-section-experience";
import { EditorSectionInternship } from "./ed-section-internship/ed-section-internship";
import { EditorSectionLanguages } from "./ed-section-languages/ed-section-languages";
import { EditorSectionListSkeleton } from "./ed-section-list-skeleton";
import { EditorSectionOrganizations } from "./ed-section-organizations/ed-section-organizations";
import { EditorSectionPersonal } from "./ed-section-personal/ed-section-personal";
import { EditorSectionProjects } from "./ed-section-projects/ed-section-projects";
import { EditorSectionSkills } from "./ed-section-skills/ed-section-skills";
import { EditorSectionSummary } from "./ed-section-summary/ed-section-summary";
import {
  EditorSectionSortableItem,
  SECTION_TRIGGER_INSET,
} from "./editor-section-sortable-item";

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

function sectionEditor(section: Section): ReactNode {
  if (section.type === "custom") {
    return <EditorSectionCustom sectionId={section.id} />;
  }
  const Editor = SECTION_EDITORS[section.type];
  if (!Editor) return null;
  return <Editor />;
}

export function EditorSectionList() {
  const openStatus = useResumeStore((state) => state.openStatus);
  const open = useResumeStore((state) => state.open);
  const undoEpoch = useResumeStore((state) => state.undoEpoch);
  const reorderSections = useResumeStore((state) => state.reorderSections);
  const t = useTranslations("editor.chrome");

  // Controlled accordion open-state, single-open so only the section being
  // edited is visible. Item values are the section id for custom sections (so a
  // newly added one can be opened by id) and the section type for the rest;
  // explicit values keep the open section open across the undo-epoch remount.
  // Stale ids from another résumé simply match nothing.
  const openSections = useEditorChromeStore((state) => state.openSections);
  const setOpenSections = useEditorChromeStore(
    (state) => state.setOpenSections,
  );

  if (!open) {
    if (openStatus === "missing") {
      return (
        <p className="px-4 py-8 text-sm text-muted-foreground">
          {t("notFound")}
        </p>
      );
    }

    return <EditorSectionListSkeleton />;
  }

  const reorderable = A.filter(open.sections, (section) =>
    isReorderableSection(section.type),
  );

  // Keyed by the open résumé and the undo epoch so a load, switch, undo, or
  // redo remounts the forms; the forms own their values (RHF writes into the
  // store, never the reverse), so a remount is the only way a rewound document
  // reaches them and the uncontrolled rich-text editors. Personal Details (the
  // Header) and Summary are pinned; the rest drag to reorder.
  return (
    <div className="lg:pb-4">
      <Accordion
        key={`${open.id}:${undoEpoch}`}
        value={openSections}
        onValueChange={setOpenSections}
        onPointerEnter={() => void preloadRichTextEditor()}
        onFocus={() => void preloadRichTextEditor()}
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
            const content = sectionEditor(section);
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

      <EditorSectionCustomAdd onAdded={(id) => setOpenSections([id])} />
    </div>
  );
}
