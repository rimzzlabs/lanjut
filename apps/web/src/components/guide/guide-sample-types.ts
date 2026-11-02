import type { TemplateId } from "@lanjut/resume/templates";

export interface GuideSampleTemplate {
  id: TemplateId;
  name: string;
  description: string;
}

export interface GuideSampleLabels {
  open: string;
  allTemplates: string;
  useTemplate: string;
}
