import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { JurnalCertificateItem } from "./jurnal-certificate-item";
import { JurnalEducationItem } from "./jurnal-education-item";
import { JurnalExperienceItem } from "./jurnal-experience-item";
import { JurnalHeader } from "./jurnal-header";
import { JurnalSectionHeading } from "./jurnal-section-heading";

interface JurnalBlockViewProps {
  block: ResumeBlock;
}

/** "Jurnal": an editorial Source Serif page with a thick rule under each heading. */
export function JurnalBlockView(props: JurnalBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <JurnalHeader {...block.header} />;
    case "heading":
      return <JurnalSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} className="font-serif" />;
    case "experience":
      return <JurnalExperienceItem {...block.item} />;
    case "education":
      return <JurnalEducationItem {...block.item} />;
    case "certificate":
      return <JurnalCertificateItem {...block.item} />;
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
