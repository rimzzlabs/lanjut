import type { InlineRun, RichBlock } from "@lanjut/resume/rich-content";
import { cn } from "@lanjut/ui/lib/utils";
import { A } from "@mobily/ts-belt";
import { createContext, use } from "react";

function RichRun(props: InlineRun) {
  let node: React.ReactNode = props.text;
  if (props.bold) node = <strong className="font-semibold">{node}</strong>;
  if (props.italic) node = <em>{node}</em>;
  if (props.href) {
    node = (
      <a href={props.href} className="underline">
        {node}
      </a>
    );
  }
  return node;
}

/*
 * Index keys are deliberate throughout this renderer: blocks/runs are a
 * stateless linear projection re-derived wholesale from the document, never
 * reordered in place, and their text content is not unique (duplicate
 * paragraphs would collide as keys).
 */

function RichRuns(props: { runs: ReadonlyArray<InlineRun> }) {
  return props.runs.map((run, index) => {
    // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
    return <RichRun key={index} {...run} />;
  });
}

/**
 * When true, lists draw their markers as text before each item instead of as
 * CSS list markers. The PDF needs this: takumi-pdf writes a CSS marker after
 * the item's text, and résumé parsers find bullets by a leading "•".
 */
export const TextListMarkersContext = createContext(false);

interface RichListItemProps {
  runs: ReadonlyArray<InlineRun>;
  marker: string;
}

function RichListItem(props: RichListItemProps) {
  const textMarkers = use(TextListMarkersContext);
  if (!textMarkers) {
    return (
      <li>
        <RichRuns runs={props.runs} />
      </li>
    );
  }
  // Baseline alignment keeps a marker set in another font (Square Bullet) on
  // its item's text line.
  return (
    <li className="flex items-baseline">
      <span className="w-5 shrink-0 pr-1.5 text-right">
        <span data-list-marker className="inline-block">
          {props.marker}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <RichRuns runs={props.runs} />
      </span>
    </li>
  );
}

interface ResumeRichTextProps {
  blocks: ReadonlyArray<RichBlock>;
  className?: string;
}

/**
 * Renders `RichBlock`s as the résumé preview's prose: paragraphs and bullet /
 * ordered lists with bold, italic, and link marks. Shared by every rich field
 * (summary, experience, education) so formatting is consistent.
 */
export function ResumeRichText(props: ResumeRichTextProps) {
  const textMarkers = use(TextListMarkersContext);
  if (A.isEmpty(props.blocks)) return null;
  return (
    <div
      className={cn(
        // The document's resolved line height (see resumeTypographyStyle), so
        // the on-screen body rhythm matches the PDF page's.
        "space-y-1 resume-body-xs leading-(--resume-line-height,1.4) text-muted-foreground",
        props.className,
      )}
    >
      {props.blocks.map((block, index) => {
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          const markerClass = block.ordered ? "list-decimal" : "list-disc";
          const listClass = cn(
            "space-y-1",
            textMarkers ? "list-none" : `pl-5 ${markerClass}`,
          );
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
            <ListTag key={index} className={listClass}>
              {block.items.map((runs, itemIndex) => {
                return (
                  <RichListItem
                    // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
                    key={itemIndex}
                    runs={runs}
                    marker={block.ordered ? `${itemIndex + 1}.` : "•"}
                  />
                );
              })}
            </ListTag>
          );
        }
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
          <p key={index}>
            <RichRuns runs={block.runs} />
          </p>
        );
      })}
    </div>
  );
}
