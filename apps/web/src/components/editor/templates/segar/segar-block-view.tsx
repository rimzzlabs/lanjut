import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { SegarCertificateItem } from "./segar-certificate-item";
import { SegarEducationItem } from "./segar-education-item";
import { SegarExperienceItem } from "./segar-experience-item";
import { SegarHeader } from "./segar-header";
import { SegarSectionHeading } from "./segar-section-heading";

interface SegarBlockViewProps {
  block: ResumeBlock;
}

/** "Segar": a compact, modern Open Sans page with a large name and underlined headings. */
export function SegarBlockView(props: SegarBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <SegarHeader {...block.header} />;
    case "heading":
      return <SegarSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <SegarExperienceItem {...block.item} />;
    case "education":
      return <SegarEducationItem {...block.item} />;
    case "certificate":
      return <SegarCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} columns={block.columns} />;
    case "languages":
      return (
        <ResumeLanguagesList items={block.items} columns={block.columns} />
      );
  }
}
