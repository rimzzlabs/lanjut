import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { TengahCertificateItem } from "./tengah-certificate-item";
import { TengahEducationItem } from "./tengah-education-item";
import { TengahExperienceItem } from "./tengah-experience-item";
import { TengahHeader } from "./tengah-header";
import { TengahSectionHeading } from "./tengah-section-heading";

interface TengahBlockViewProps {
  block: ResumeBlock;
}

/** "Tengah": a centered header, with each heading centered between two rules. */
export function TengahBlockView(props: TengahBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <TengahHeader {...block.header} />;
    case "heading":
      return <TengahSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <TengahExperienceItem {...block.item} />;
    case "education":
      return <TengahEducationItem {...block.item} />;
    case "certificate":
      return <TengahCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} columns={block.columns} />;
    case "languages":
      return (
        <ResumeLanguagesList items={block.items} columns={block.columns} />
      );
  }
}
