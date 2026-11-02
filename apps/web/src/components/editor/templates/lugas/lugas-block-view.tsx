import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { LugasCertificateItem } from "./lugas-certificate-item";
import { LugasEducationItem } from "./lugas-education-item";
import { LugasExperienceItem } from "./lugas-experience-item";
import { LugasHeader } from "./lugas-header";
import { LugasSectionHeading } from "./lugas-section-heading";

interface LugasBlockViewProps {
  block: ResumeBlock;
}

/** "Lugas": a direct Roboto page with a rule above each heading and contact icons. */
export function LugasBlockView(props: LugasBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <LugasHeader {...block.header} />;
    case "heading":
      return <LugasSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <LugasExperienceItem {...block.item} />;
    case "education":
      return <LugasEducationItem {...block.item} />;
    case "certificate":
      return <LugasCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} columns={block.columns} />;
    case "languages":
      return (
        <ResumeLanguagesList items={block.items} columns={block.columns} />
      );
  }
}
