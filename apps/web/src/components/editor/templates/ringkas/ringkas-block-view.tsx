import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { RingkasCertificateItem } from "./ringkas-certificate-item";
import { RingkasEducationItem } from "./ringkas-education-item";
import { RingkasExperienceItem } from "./ringkas-experience-item";
import { RingkasHeader } from "./ringkas-header";
import { RingkasSectionHeading } from "./ringkas-section-heading";

interface RingkasBlockViewProps {
  block: ResumeBlock;
}

/** "Ringkas": the most compact layout, with small gray headings and tight spacing. */
export function RingkasBlockView(props: RingkasBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <RingkasHeader {...block.header} />;
    case "heading":
      return <RingkasSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <RingkasExperienceItem {...block.item} />;
    case "education":
      return <RingkasEducationItem {...block.item} />;
    case "certificate":
      return <RingkasCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} columns={block.columns} />;
    case "languages":
      return (
        <ResumeLanguagesList items={block.items} columns={block.columns} />
      );
  }
}
