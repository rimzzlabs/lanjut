import { A } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import type { ReactNode } from "react";

function withMark(
  mark: { type: string; attrs?: Record<string, unknown> },
  child: ReactNode,
): ReactNode {
  if (mark.type === "bold") return <strong>{child}</strong>;
  if (mark.type === "italic") return <em>{child}</em>;
  if (mark.type === "underline") return <u>{child}</u>;
  if (mark.type === "link") return <span className="underline">{child}</span>;
  return child;
}

function FeedbackRichNode(props: { node: JSONContent }): ReactNode {
  const { node } = props;
  const children = (node.content ?? []).map((child, index) => (
    // The preview never reorders nodes, so the position is a stable key.
    // biome-ignore lint/suspicious/noArrayIndexKey: a read-only render of a fixed document.
    <FeedbackRichNode key={index} node={child} />
  ));

  switch (node.type) {
    case "text":
      return A.reduceReverse<
        { type: string; attrs?: Record<string, unknown> },
        ReactNode
      >(node.marks ?? [], node.text ?? "", (child, mark) =>
        withMark(mark, child),
      );
    case "paragraph":
      return <p>{children}</p>;
    case "bulletList":
      return <ul className="list-disc pl-5">{children}</ul>;
    case "orderedList":
      return <ol className="list-decimal pl-5">{children}</ol>;
    case "listItem":
      return <li>{children}</li>;
    default:
      return <>{children}</>;
  }
}

/** A rich answer as the reporter wrote it, read-only, for the preview. */
export function FeedbackRichText(props: { doc: JSONContent }) {
  return (
    <div className="flex flex-col gap-2 text-sm wrap-break-word">
      <FeedbackRichNode node={props.doc} />
    </div>
  );
}
