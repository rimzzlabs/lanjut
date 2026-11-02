import { templateNameOf } from "@lanjut/resume/templates";
import { A } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { LandingLooksMoreRow } from "./landing-looks-more-row";
import { LandingLooksRow } from "./landing-looks-row";
import { LANDING_SHOWCASE } from "./landing-looks-showcase";

interface LandingLooksListProps {
  active: number;
  onSelect: (index: number) => void;
  preview: ResumePreview;
}

/** The showcased templates as rows; the open row is the one the page shows. */
export function LandingLooksList(props: LandingLooksListProps) {
  const t = useTranslations("landing");
  const moreIndex = A.length(LANDING_SHOWCASE);

  return (
    <ol className="border-l border-border">
      {LANDING_SHOWCASE.map((item, index) => (
        <LandingLooksRow
          key={item.id}
          id={item.id}
          name={templateNameOf(item.id)}
          look={t(item.look)}
          preview={props.preview}
          open={index === props.active}
          onSelect={() => props.onSelect(index)}
        />
      ))}
      <LandingLooksMoreRow
        open={props.active === moreIndex}
        preview={props.preview}
        onSelect={() => props.onSelect(moreIndex)}
      />
    </ol>
  );
}
