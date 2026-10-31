import type { TemplateId } from "@lanjut/resume/templates";
import { type CSSProperties, useMemo } from "react";
import { buildResumeBlocks } from "./resume-blocks";
import { ResumeFontFaces, resumeTypographyStyle } from "./resume-fonts";
import { A4 } from "./resume-geometry";
import { ResumeHeadingsContext } from "./resume-heading";
import { ResumePage } from "./resume-page";
import type { ResumePreview } from "./resume-preview";
import { TEMPLATE_BLOCK_VIEWS } from "./templates/template-block-view";

interface ResumeThumbnailProps {
  resume: ResumePreview;
  template: TemplateId;
}

// The thumbnail's width over the A4 width, as a plain number. CSS has no
// division of two lengths, but tan(atan2(a, b)) equals a / b, and every
// browser the app supports computes it. 100cqw is the thumbnail's own width.
const SCALE = `tan(atan2(100cqw, ${A4.widthPx}px))`;

// An off-screen thumbnail skips layout and paint, and so loads no font, until
// it comes near the viewport. The explicit height keeps its room meanwhile.
const FRAME_STYLE: CSSProperties = {
  height: `calc(${A4.heightPx}px * ${SCALE})`,
  contentVisibility: "auto",
};

const PAGE_STYLE: CSSProperties = {
  width: A4.widthPx,
  transform: `scale(${SCALE})`,
  transformOrigin: "top left",
};

/**
 * A miniature, non-interactive render of a résumé's first page, scaled with a
 * CSS transform to fill the container width. Unlike ResumeDocument there is no
 * measurement or pagination pass (blocks flow linearly and the page frame's
 * overflow clipping cuts everything past page one) so it is cheap enough to
 * render per card in a grid. The scale is CSS alone, so the static HTML
 * already holds the finished page.
 */
export function ResumeThumbnail(props: ResumeThumbnailProps) {
  const blocks = useMemo(() => buildResumeBlocks(props.resume), [props.resume]);
  const BlockView = TEMPLATE_BLOCK_VIEWS[props.template];

  // The page keeps its full A4 layout width under the scale transform. The
  // size container's inline-size containment stops that width from sizing an
  // auto track around the thumbnail. `data-nosnippet` keeps the sample text
  // out of search snippets.
  return (
    <div
      inert
      aria-hidden
      data-nosnippet
      data-template={props.template}
      className="pointer-events-none w-full select-none font-sans @container"
      style={resumeTypographyStyle(props.resume, props.template)}
    >
      <ResumeFontFaces />
      <ResumeHeadingsContext value={false}>
        <div style={FRAME_STYLE}>
          <div style={PAGE_STYLE}>
            <ResumePage page={1} total={1}>
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  style={{ marginTop: index === 0 ? 0 : block.gapBefore }}
                >
                  <BlockView block={block} />
                </div>
              ))}
            </ResumePage>
          </div>
        </div>
      </ResumeHeadingsContext>
    </div>
  );
}
