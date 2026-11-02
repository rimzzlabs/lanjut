import { cn } from "@lanjut/ui/lib/utils";
import { A } from "@mobily/ts-belt";
import type { ReactNode } from "react";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { LandingLooksFan } from "./landing-looks-fan";
import { LANDING_SHOWCASE } from "./landing-looks-showcase";

interface LandingLooksStageProps {
  preview: ResumePreview;
  /** The open row; one past the last template is the closing row. */
  active: number;
}

/** The page beside the list. Every look is drawn once and stacked, so a row change is a fade. */
export function LandingLooksStage(props: LandingLooksStageProps) {
  const closing = props.active >= A.length(LANDING_SHOWCASE);

  return (
    <div
      aria-hidden
      className="relative ml-auto aspect-3/4 h-[min(82svh,48rem)]"
    >
      {LANDING_SHOWCASE.map((item, index) => (
        <StageLayer key={item.id} visible={index === props.active}>
          <div className="h-full overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/10">
            <ResumeThumbnail resume={props.preview} template={item.id} />
          </div>
        </StageLayer>
      ))}
      <StageLayer visible={closing}>
        <div className="grid h-full place-items-center">
          <LandingLooksFan preview={props.preview} />
        </div>
      </StageLayer>
    </div>
  );
}

function StageLayer(props: { visible: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none",
        props.visible ? "opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      {props.children}
    </div>
  );
}
