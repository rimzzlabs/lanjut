import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { KodeCertificateItem } from "./kode-certificate-item";
import { KodeEducationItem } from "./kode-education-item";
import { KodeExperienceItem } from "./kode-experience-item";
import { KodeHeader } from "./kode-header";
import { KodeSectionHeading } from "./kode-section-heading";

interface KodeBlockViewProps {
  block: ResumeBlock;
}

/** "Kode": IBM Plex Mono heads over an Inter body, with dotted heading rules and contact icons. */
export function KodeBlockView(props: KodeBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <KodeHeader {...block.header} />;
    case "heading":
      return <KodeSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <KodeExperienceItem {...block.item} />;
    case "education":
      return <KodeEducationItem {...block.item} />;
    case "certificate":
      return <KodeCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} columns={block.columns} />;
    case "languages":
      return (
        <ResumeLanguagesList items={block.items} columns={block.columns} />
      );
  }
}
