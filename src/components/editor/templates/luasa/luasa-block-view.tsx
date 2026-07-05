import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeSkillsList } from "../../resume-skills-list";
import { LuasaCertificateItem } from "./luasa-certificate-item";
import { LuasaEducationItem } from "./luasa-education-item";
import { LuasaExperienceItem } from "./luasa-experience-item";
import { LuasaHeader } from "./luasa-header";
import { LuasaSectionHeading } from "./luasa-section-heading";
import { LuasaSummaryBody } from "./luasa-summary-body";

interface LuasaBlockViewProps {
  block: ResumeBlock;
}

/** "Luasa": an airy minimalist layout with slim accent bars and letterspaced headings. */
export function LuasaBlockView(props: LuasaBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <LuasaHeader {...block.header} />;
    case "heading":
      return <LuasaSectionHeading title={block.title} />;
    case "summary":
      return <LuasaSummaryBody body={block.body} />;
    case "experience":
      return <LuasaExperienceItem {...block.item} />;
    case "education":
      return <LuasaEducationItem {...block.item} />;
    case "certificate":
      return <LuasaCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} />;
    case "languages":
      return <ResumeLanguagesList items={block.items} />;
  }
}
