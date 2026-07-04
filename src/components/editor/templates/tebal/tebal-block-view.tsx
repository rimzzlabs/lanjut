import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { TebalCertificateItem } from "./tebal-certificate-item";
import { TebalEducationItem } from "./tebal-education-item";
import { TebalExperienceItem } from "./tebal-experience-item";
import { TebalHeader } from "./tebal-header";
import { TebalSectionHeading } from "./tebal-section-heading";

interface TebalBlockViewProps {
  block: ResumeBlock;
}

/** "Tebal" — a bold modern statement with heavy uppercase headings over thick rules. */
export function TebalBlockView(props: TebalBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <TebalHeader {...block.header} />;
    case "heading":
      return <TebalSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <TebalExperienceItem {...block.item} />;
    case "education":
      return <TebalEducationItem {...block.item} />;
    case "certificate":
      return <TebalCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} />;
    case "languages":
      return <ResumeLanguagesList items={block.items} />;
  }
}
