import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { KertasCertificateItem } from "./kertas-certificate-item";
import { KertasEducationItem } from "./kertas-education-item";
import { KertasExperienceItem } from "./kertas-experience-item";
import { KertasHeader } from "./kertas-header";
import { KertasSectionHeading } from "./kertas-section-heading";

interface KertasBlockViewProps {
  block: ResumeBlock;
}

/** "Kertas": an academic page in a Times-metric serif with a centered uppercase name. */
export function KertasBlockView(props: KertasBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <KertasHeader {...block.header} />;
    case "heading":
      return <KertasSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} className="font-serif" />;
    case "experience":
      return <KertasExperienceItem {...block.item} />;
    case "education":
      return <KertasEducationItem {...block.item} />;
    case "certificate":
      return <KertasCertificateItem {...block.item} />;
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
