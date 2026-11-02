import type { ResumeBlock } from "../../resume-blocks";
import { ResumeLanguagesList } from "../../resume-languages-list";
import { ResumeRichText } from "../../resume-rich-text";
import { ResumeSkillsList } from "../../resume-skills-list";
import { AnggunCertificateItem } from "./anggun-certificate-item";
import { AnggunEducationItem } from "./anggun-education-item";
import { AnggunExperienceItem } from "./anggun-experience-item";
import { AnggunHeader } from "./anggun-header";
import { AnggunSectionHeading } from "./anggun-section-heading";

interface AnggunBlockViewProps {
  block: ResumeBlock;
}

/**
 * "Anggun": a soft Garamond page with a centered header and italic headings.
 * Every part sets `font-kerning: none`: EB Garamond kerns "fi" apart, and at
 * the widest letter spacing a PDF extractor then reads "Certif ied".
 */
export function AnggunBlockView(props: AnggunBlockViewProps) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <AnggunHeader {...block.header} />;
    case "heading":
      return <AnggunSectionHeading title={block.title} />;
    case "summary":
      return (
        <ResumeRichText
          blocks={block.body}
          className="font-serif [font-kerning:none]"
        />
      );
    case "experience":
      return <AnggunExperienceItem {...block.item} />;
    case "education":
      return <AnggunEducationItem {...block.item} />;
    case "certificate":
      return <AnggunCertificateItem {...block.item} />;
    case "skills":
      return (
        <div className="font-serif [font-kerning:none]">
          <ResumeSkillsList items={block.items} columns={block.columns} />
        </div>
      );
    case "languages":
      return (
        <div className="font-serif [font-kerning:none]">
          <ResumeLanguagesList items={block.items} columns={block.columns} />
        </div>
      );
  }
}
