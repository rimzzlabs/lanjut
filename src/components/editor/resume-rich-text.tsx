import { cn } from "@/lib/utils";
import type { InlineRun, RichBlock } from "./rich-content";

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

function RichRuns(props: { runs: InlineRun[] }) {
  return props.runs.map((run, index) => {
    // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
    return <RichRun key={index} {...run} />;
  });
}

interface ResumeRichTextProps {
  blocks: RichBlock[];
  className?: string;
}

/**
 * Renders `RichBlock`s as the résumé preview's prose: paragraphs and bullet /
 * ordered lists with bold, italic, and link marks. Shared by every rich field
 * (summary, experience, education) so formatting is consistent.
 */
export function ResumeRichText(props: ResumeRichTextProps) {
  if (props.blocks.length === 0) return null;
  return (
    <div
      className={cn(
        "space-y-1 text-xs leading-relaxed text-muted-foreground",
        props.className,
      )}
    >
      {props.blocks.map((block, index) => {
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          const listClass = cn(
            "space-y-1 pl-5",
            block.ordered ? "list-decimal" : "list-disc",
          );
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
            <ListTag key={index} className={listClass}>
              {block.items.map((runs, itemIndex) => {
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
                  <li key={itemIndex}>
                    <RichRuns runs={runs} />
                  </li>
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
