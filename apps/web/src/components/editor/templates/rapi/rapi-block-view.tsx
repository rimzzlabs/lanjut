import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { RapiCertificateItem } from "./rapi-certificate-item";
import { RapiEducationItem } from "./rapi-education-item";
import { RapiExperienceItem } from "./rapi-experience-item";
import { RapiHeader } from "./rapi-header";
import { RapiSectionHeading } from "./rapi-section-heading";

interface RapiBlockViewProps {
  block: ResumeBlock;
}

/** "Rapi": a tidy corporate page in a Calibri-metric sans with gray-ruled headings. */
export function RapiBlockView(props: RapiBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <RapiHeader {...block.header} />;
    case "heading":
      return <RapiSectionHeading title={block.title} />;
    case "summary":
      return <ResumeRichText blocks={block.body} />;
    case "experience":
      return <RapiExperienceItem {...block.item} />;
    case "education":
      return <RapiEducationItem {...block.item} />;
    case "certificate":
      return <RapiCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} columns={block.columns} />;
    case "languages":
      return (
        <ResumeLanguagesList items={block.items} columns={block.columns} />
      );
  }
}
