"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TemplateId } from "@/lib/templates";
import { buildResumeBlocks } from "./resume-blocks";
import { A4, CONTENT_HEIGHT_PX, CONTENT_WIDTH_PX } from "./resume-geometry";
import { ResumePage } from "./resume-page";
import { paginate } from "./resume-paginate";
import type { ResumePreview } from "./resume-preview";
import { TEMPLATE_BLOCK_VIEWS } from "./templates/template-block-view";

interface ResumeDocumentProps {
  resume: ResumePreview;
  template: TemplateId;
}

/** Vertical gap between stacked pages (matches the `gap-6` on the page stack). */
const PAGE_GAP_PX = 24;

/**
 * Renders a résumé as exact A4 pages, reflowing content across pages as it grows.
 * Pagination is presentation-only: blocks are measured off-screen at the printable
 * width, then packed into page-height buckets without reordering (linear reading
 * order, and therefore parse/export order, is preserved).
 *
 * The rendered stack is scaled to fit the available width (never upscaled past
 * 100%) so the fixed A4 page shrinks as the surrounding panel narrows. Scaling is
 * a CSS transform on the whole stack; it changes nothing about text order.
 */
export function ResumeDocument(props: ResumeDocumentProps) {
  const blocks = useMemo(() => buildResumeBlocks(props.resume), [props.resume]);
  const BlockView = TEMPLATE_BLOCK_VIEWS[props.template];
  const measureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [availableWidth, setAvailableWidth] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `blocks` and `BlockView` are deliberate re-run triggers; the ResizeObserver only fires when the layer's total size changes, which misses block-id swaps or template restyles that keep the layout size (stale height keys collapse pagination).
  useEffect(() => {
    const layer = measureRef.current;
    if (!layer) return;

    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const next: Record<string, number> = {};
      layer.querySelectorAll<HTMLElement>("[data-block-id]").forEach((node) => {
        const id = node.dataset.blockId;
        if (id) next[id] = node.getBoundingClientRect().height;
      });
      setHeights(next);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(layer);
    // Web fonts change line-box heights; re-measure once they have loaded.
    document.fonts?.ready.then(measure);
    measure();

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [blocks, BlockView]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setAvailableWidth(entry.contentRect.width);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const pages = useMemo(
    () => paginate(blocks, heights, CONTENT_HEIGHT_PX),
    [blocks, heights],
  );

  const scale =
    availableWidth > 0 ? Math.min(1, availableWidth / A4.widthPx) : 1;
  const naturalHeight =
    pages.length * A4.heightPx + Math.max(0, pages.length - 1) * PAGE_GAP_PX;

  return (
    <div ref={containerRef} className="w-full">
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 -z-10"
        style={{ width: CONTENT_WIDTH_PX }}
      >
        {blocks.map((block) => (
          <div key={block.id} data-block-id={block.id}>
            <BlockView block={block} />
          </div>
        ))}
      </div>

      <div
        className="mx-auto"
        style={{ width: A4.widthPx * scale, height: naturalHeight * scale }}
      >
        <div
          className="flex flex-col gap-6"
          style={{
            width: A4.widthPx,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {pages.map((pageBlocks, index, items) => (
            <ResumePage
              page={index + 1}
              total={items.length}
              key={pageBlocks[0].id}
            >
              {pageBlocks.map((block, index) => (
                <div
                  key={block.id}
                  style={{ marginTop: index === 0 ? 0 : block.gapBefore }}
                >
                  <BlockView block={block} />
                </div>
              ))}
            </ResumePage>
          ))}
        </div>
      </div>
    </div>
  );
}
