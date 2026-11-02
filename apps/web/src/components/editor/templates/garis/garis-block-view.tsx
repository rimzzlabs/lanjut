import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { GarisCertificateItem } from "./garis-certificate-item";
import { GarisEducationItem } from "./garis-education-item";
import { GarisExperienceItem } from "./garis-experience-item";
import { GarisHeader } from "./garis-header";
import { GarisSectionHeading } from "./garis-section-heading";

interface GarisBlockViewProps {
  block: ResumeBlock;
}

/** "Garis": a clean sans page whose headings run into a thin rule. */
export function GarisBlockView(props: GarisBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <GarisHeader {...block.header} />;
    case "heading":
      return <GarisSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <GarisExperienceItem {...block.item} />;
    case "education":
      return <GarisEducationItem {...block.item} />;
    case "certificate":
      return <GarisCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} columns={block.columns} />;
    case "languages":
      return (
        <ResumeLanguagesList items={block.items} columns={block.columns} />
      );
  }
}
