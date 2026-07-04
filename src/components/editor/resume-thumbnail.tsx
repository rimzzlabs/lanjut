"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TemplateId } from "@/lib/templates";
import { buildResumeBlocks } from "./resume-blocks";
import { A4 } from "./resume-geometry";
import { ResumePage } from "./resume-page";
import type { ResumePreview } from "./resume-preview";
import { TEMPLATE_BLOCK_VIEWS } from "./templates/template-block-view";

interface ResumeThumbnailProps {
  resume: ResumePreview;
  template: TemplateId;
}

/**
 * A miniature, non-interactive render of a résumé's first page, scaled with a
 * CSS transform to fill the container width. Unlike ResumeDocument there is no
 * measurement or pagination pass — blocks flow linearly and the page frame's
 * overflow clipping cuts everything past page one — so it is cheap enough to
 * render per card in a grid.
 */
export function ResumeThumbnail(props: ResumeThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const blocks = useMemo(() => buildResumeBlocks(props.resume), [props.resume]);
  const BlockView = TEMPLATE_BLOCK_VIEWS[props.template];
  const scale = width > 0 ? width / A4.widthPx : 0;

  return (
    <div
      ref={containerRef}
      inert
      aria-hidden
      data-template={props.template}
      className="pointer-events-none w-full select-none"
    >
      {scale > 0 && (
        <div style={{ height: A4.heightPx * scale }}>
          <div
            style={{
              width: A4.widthPx,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
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
      )}
    </div>
  );
}
