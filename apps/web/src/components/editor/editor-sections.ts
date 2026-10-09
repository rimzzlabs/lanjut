import {
  BackpackIcon,
  BriefcaseIcon,
  CertificateIcon,
  FolderSimpleIcon,
  GraduationCapIcon,
  type Icon,
  LightningIcon,
  TextAlignLeftIcon,
  TranslateIcon,
  UserCircleIcon,
  UsersIcon,
} from "@phosphor-icons/react";

export type EditorSectionId =
  | "personal-details"
  | "experience"
  | "internship"
  | "projects"
  | "organizations"
  | "education"
  | "skills"
  | "languages"
  | "certificates"
  | "summary";

export interface EditorSectionDescriptor {
  id: EditorSectionId;
  label: string;
  icon: Icon;
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
    icon: UserCircleIcon,
    required: true,
  },
  {
    id: "experience",
    label: "Experience",
    icon: BriefcaseIcon,
    required: false,
  },
  {
    id: "internship",
    label: "Internship",
    icon: BackpackIcon,
    required: false,
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderSimpleIcon,
    required: false,
  },
  {
    id: "organizations",
    label: "Organizations",
    icon: UsersIcon,
    required: false,
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCapIcon,
    required: false,
  },
  { id: "skills", label: "Skills", icon: LightningIcon, required: false },
  { id: "languages", label: "Languages", icon: TranslateIcon, required: false },
  {
    id: "certificates",
    label: "Certificates",
    icon: CertificateIcon,
    required: false,
  },
  { id: "summary", label: "Summary", icon: TextAlignLeftIcon, required: false },
];
