import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { KetatCertificateItem } from "./ketat-certificate-item";
import { KetatEducationItem } from "./ketat-education-item";
import { KetatExperienceItem } from "./ketat-experience-item";
import { KetatHeader } from "./ketat-header";
import { KetatSectionHeading } from "./ketat-section-heading";

interface KetatBlockViewProps {
  block: ResumeBlock;
}

/** "Ketat": a compact serif classic with centered, ruled section headings. */
export function KetatBlockView(props: KetatBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <KetatHeader {...block.header} />;
    case "heading":
      return <KetatSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <KetatExperienceItem {...block.item} />;
    case "education":
      return <KetatEducationItem {...block.item} />;
    case "certificate":
      return <KetatCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} />;
    case "languages":
      return <ResumeLanguagesList items={block.items} />;
  }
}
