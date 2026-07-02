import { cn } from "@/lib/utils";
import type { InlineRun, RichBlock } from "./rich-content";

function runsText(runs: InlineRun[]): string {
  return runs.map((run) => run.text).join("");
}

function runKey(run: InlineRun): string {
  return `${run.href ?? ""}|${run.bold ? "b" : ""}${run.italic ? "i" : ""}|${run.text}`;
}

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

function RichRuns(props: { runs: InlineRun[] }) {
  return props.runs.map((run) => <RichRun key={runKey(run)} {...run} />);
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
      {props.blocks.map((block) => {
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={block.items.map(runsText).join("|")}
              className={cn(
                "space-y-1 pl-5",
                block.ordered ? "list-decimal" : "list-disc",
              )}
            >
              {block.items.map((runs) => (
                <li key={runsText(runs)}>
                  <RichRuns runs={runs} />
                </li>
              ))}
            </ListTag>
          );
        }
        return (
          <p key={runsText(block.runs)}>
            <RichRuns runs={block.runs} />
          </p>
        );
      })}
    </div>
  );
}
