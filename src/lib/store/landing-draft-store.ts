import { create } from "zustand";
import type { TemplateId } from "@/lib/templates";

export interface LandingDraft {
  firstName: string;
  lastName: string;
  jobTitle: string;
}

interface LandingDraftState {
  draft: LandingDraft;
  template: TemplateId;
  setField: (key: keyof LandingDraft, value: string) => void;
  setTemplate: (template: TemplateId) => void;
}

/**
 * In-memory draft shared by the landing page sections: the Try It form writes
 * it, the live preview renders it, the parser proof runs on it, and the CTA
 * carries it into the real editor. Never persisted; a landing visit is
 * ephemeral until the visitor creates a document.
 */
export const useLandingDraftStore = create<LandingDraftState>()((set) => ({
  draft: { firstName: "", lastName: "", jobTitle: "" },
  template: "awal",
  setField(key, value) {
    set((state) => ({ draft: { ...state.draft, [key]: value } }));
  },
  setTemplate(template) {
    set({ template });
  },
}));
