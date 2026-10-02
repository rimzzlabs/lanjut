import { A } from "@mobily/ts-belt";
import type { Resume, Section, SectionType } from "./types";

type SectionsUpdate = (
  sections: ReadonlyArray<Section>,
) => ReadonlyArray<Section>;

/** A copy of the résumé with its section list replaced by `update`. */
export function updateSections(resume: Resume, update: SectionsUpdate): Resume {
  return { ...resume, sections: update(resume.sections) };
}

/** Data-last: replaces the section with this id. Use inside `updateSections`. */
export function updateSectionById(
  id: string,
  update: (section: Section) => Section,
): SectionsUpdate {
  return A.map((section) => (section.id === id ? update(section) : section));
}

/** Data-last: replaces every section of this type. Use inside `updateSections`. */
export function updateSectionOfType(
  type: SectionType,
  update: (section: Section) => Section,
): SectionsUpdate {
  return A.map((section) =>
    section.type === type ? update(section) : section,
  );
}
