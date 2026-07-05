import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { KlasikCertificateItem } from "./klasik-certificate-item";
import { KlasikEducationItem } from "./klasik-education-item";
import { KlasikExperienceItem } from "./klasik-experience-item";
import { KlasikHeader } from "./klasik-header";
import { KlasikSectionHeading } from "./klasik-section-heading";

interface KlasikBlockViewProps {
  block: ResumeBlock;
}

/** "Klasik": a traditional all-serif CV with a centered header and quiet headings. */
export function KlasikBlockView(props: KlasikBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <KlasikHeader {...block.header} />;
    case "heading":
      return <KlasikSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} className="font-serif" />;
    case "experience":
      return <KlasikExperienceItem {...block.item} />;
    case "education":
      return <KlasikEducationItem {...block.item} />;
    case "certificate":
      return <KlasikCertificateItem {...block.item} />;
    case "skills":
      return (
        <div className="font-serif">
          <ResumeSkillsList items={block.items} />
        </div>
      );
    case "languages":
      return (
        <div className="font-serif">
          <ResumeLanguagesList items={block.items} />
        </div>
      );
  }
}
