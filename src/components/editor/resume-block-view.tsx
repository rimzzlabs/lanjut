import type { ResumeBlock } from "./resume-blocks";
import { ResumeCertificateItem } from "./resume-certificate-item";
import { ResumeEducationItem } from "./resume-education-item";
import { ResumeExperienceItem } from "./resume-experience-item";
import { ResumeHeader } from "./resume-header";
import { ResumeLanguagesList } from "./resume-languages-list";
import { ResumeSectionHeading } from "./resume-section-heading";
import { ResumeSkillsList } from "./resume-skills-list";
import { ResumeSummaryBody } from "./resume-summary-body";

interface ResumeBlockViewProps {
  block: ResumeBlock;
}

export function ResumeBlockView(props: ResumeBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <ResumeHeader {...block.header} />;
    case "heading":
      return <ResumeSectionHeading title={block.title} />;
    case "summary":
      return <ResumeSummaryBody body={block.body} />;
    case "experience":
      return <ResumeExperienceItem {...block.item} />;
    case "education":
      return <ResumeEducationItem {...block.item} />;
    case "certificate":
      return <ResumeCertificateItem {...block.item} />;
    case "skills":
      return <ResumeSkillsList items={block.items} />;
    case "languages":
      return <ResumeLanguagesList items={block.items} />;
  }
}
