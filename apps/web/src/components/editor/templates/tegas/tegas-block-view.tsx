import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { TegasCertificateItem } from "./tegas-certificate-item";
import { TegasEducationItem } from "./tegas-education-item";
import { TegasExperienceItem } from "./tegas-experience-item";
import { TegasHeader } from "./tegas-header";
import { TegasSectionHeading } from "./tegas-section-heading";

interface TegasBlockViewProps {
  block: ResumeBlock;
}

/** "Tegas": Merriweather headings over a Source Sans body, each heading marked by a thick bar. */
export function TegasBlockView(props: TegasBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <TegasHeader {...block.header} />;
    case "heading":
      return <TegasSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <TegasExperienceItem {...block.item} />;
    case "education":
      return <TegasEducationItem {...block.item} />;
    case "certificate":
      return <TegasCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} columns={block.columns} />;
    case "languages":
      return (
        <ResumeLanguagesList items={block.items} columns={block.columns} />
      );
  }
}
