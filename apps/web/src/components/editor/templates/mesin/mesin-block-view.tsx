import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { MesinCertificateItem } from "./mesin-certificate-item";
import { MesinEducationItem } from "./mesin-education-item";
import { MesinExperienceItem } from "./mesin-experience-item";
import { MesinHeader } from "./mesin-header";
import { MesinSectionHeading } from "./mesin-section-heading";

interface MesinBlockViewProps {
  block: ResumeBlock;
}

/** "Mesin": Courier Prime typewriter heads over a Lora body, with underlined headings. */
export function MesinBlockView(props: MesinBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <MesinHeader {...block.header} />;
    case "heading":
      return <MesinSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} className="font-serif" />;
    case "experience":
      return <MesinExperienceItem {...block.item} />;
    case "education":
      return <MesinEducationItem {...block.item} />;
    case "certificate":
      return <MesinCertificateItem {...block.item} />;
    case "skills":
      return (
        <div className="font-serif">
          <ResumeSkillsList items={block.items} columns={block.columns} />
        </div>
      );
    case "languages":
      return (
        <div className="font-serif">
          <ResumeLanguagesList items={block.items} columns={block.columns} />
        </div>
      );
  }
}
