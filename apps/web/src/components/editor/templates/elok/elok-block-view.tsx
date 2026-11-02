import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { ElokCertificateItem } from "./elok-certificate-item";
import { ElokEducationItem } from "./elok-education-item";
import { ElokExperienceItem } from "./elok-experience-item";
import { ElokHeader } from "./elok-header";
import { ElokSectionHeading } from "./elok-section-heading";

interface ElokBlockViewProps {
  block: ResumeBlock;
}

/** "Elok": a Lora name over an Inter body, with a rule above each heading and contact icons. */
export function ElokBlockView(props: ElokBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <ElokHeader {...block.header} />;
    case "heading":
      return <ElokSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <ElokExperienceItem {...block.item} />;
    case "education":
      return <ElokEducationItem {...block.item} />;
    case "certificate":
      return <ElokCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} columns={block.columns} />;
    case "languages":
      return (
        <ResumeLanguagesList items={block.items} columns={block.columns} />
      );
  }
}
