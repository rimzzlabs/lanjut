import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { PolosCertificateItem } from "./polos-certificate-item";
import { PolosEducationItem } from "./polos-education-item";
import { PolosExperienceItem } from "./polos-experience-item";
import { PolosHeader } from "./polos-header";
import { PolosSectionHeading } from "./polos-section-heading";

interface PolosBlockViewProps {
  block: ResumeBlock;
}

/** "Polos": a plain, Harvard-style page in an Arial-metric sans with bold, underlined headings. */
export function PolosBlockView(props: PolosBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <PolosHeader {...block.header} />;
    case "heading":
      return <PolosSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <PolosExperienceItem {...block.item} />;
    case "education":
      return <PolosEducationItem {...block.item} />;
    case "certificate":
      return <PolosCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} columns={block.columns} />;
    case "languages":
      return (
        <ResumeLanguagesList items={block.items} columns={block.columns} />
      );
  }
}
