import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { KetikCertificateItem } from "./ketik-certificate-item";
import { KetikEducationItem } from "./ketik-education-item";
import { KetikExperienceItem } from "./ketik-experience-item";
import { KetikHeader } from "./ketik-header";
import { KetikSectionHeading } from "./ketik-section-heading";

interface KetikBlockViewProps {
  block: ResumeBlock;
}

/** "Ketik": typewriter-flavored: monospace name/headings/dates over a sans body. */
export function KetikBlockView(props: KetikBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <KetikHeader {...block.header} />;
    case "heading":
      return <KetikSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <KetikExperienceItem {...block.item} />;
    case "education":
      return <KetikEducationItem {...block.item} />;
    case "certificate":
      return <KetikCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} />;
    case "languages":
      return <ResumeLanguagesList items={block.items} />;
  }
}
