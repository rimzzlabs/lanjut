import {
  AlignLeft,
  Award,
  Briefcase,
  CircleUserRound,
  GraduationCap,
  Languages,
  type LucideIcon,
  Zap,
} from "lucide-react";

export type EditorSectionId =
  | "personal-details"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "certificates"
  | "summary";

export interface EditorSectionDescriptor {
  id: EditorSectionId;
  label: string;
  icon: LucideIcon;
  /** Required sections are always present and cannot be hidden (no visibility toggle). */
  required: boolean;
}

/**
 * The editor's section navigation, in reading order. Personal Details maps to the
 * privileged `Header` (always first, never hidden); the rest map to reorderable
 * sections. This is the sidebar's view contract, decoupled from the persisted
 * `Resume` model; an adapter will project real sections onto these descriptors.
 */
export const EDITOR_SECTIONS: EditorSectionDescriptor[] = [
  {
    id: "personal-details",
    label: "Personal Details",
    icon: CircleUserRound,
    required: true,
  },
  { id: "experience", label: "Experience", icon: Briefcase, required: false },
  { id: "education", label: "Education", icon: GraduationCap, required: false },
  { id: "skills", label: "Skills", icon: Zap, required: false },
  { id: "languages", label: "Languages", icon: Languages, required: false },
  { id: "certificates", label: "Certificates", icon: Award, required: false },
  { id: "summary", label: "Summary", icon: AlignLeft, required: false },
];
