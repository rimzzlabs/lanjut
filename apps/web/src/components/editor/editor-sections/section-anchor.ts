/** The DOM id of a section in the Content tab's list, by its item value. */
export function sectionAnchorId(value: string): string {
  return `editor-section-${value}`;
}
