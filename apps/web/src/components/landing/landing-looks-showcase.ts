import type { TemplateId } from "@lanjut/resume/templates";

export interface LandingShowcaseItem {
  id: TemplateId;
  look: string;
}

/** The five templates the landing page walks through, picked to look as different as possible. */
export const LANDING_SHOWCASE: ReadonlyArray<LandingShowcaseItem> = [
  { id: "awal", look: "lookAwal" },
  { id: "tebal", look: "lookTebal" },
  { id: "klasik", look: "lookKlasik" },
  { id: "ketik", look: "lookKetik" },
  { id: "tegas", look: "lookTegas" },
];
