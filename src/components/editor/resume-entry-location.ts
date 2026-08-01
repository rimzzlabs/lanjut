/**
 * An entry's location rides on the same line as its company or institution,
 * comma-separated ("Acme Inc., San Francisco, CA"). A comma keeps the pair one
 * readable phrase for résumé parsers, which is why every renderer (preview,
 * PDF, docx, plain text) joins it the same way.
 */
export function withLocation(subject: string, location?: string): string {
  return [subject, location].filter(Boolean).join(", ");
}

/**
 * The location tail alone, for renderers that draw the subject separately
 * (a linked company name gets its own anchor, the location never does).
 */
export function locationSuffix(subject: string, location?: string): string {
  if (!location) return "";
  return subject ? `, ${location}` : location;
}
