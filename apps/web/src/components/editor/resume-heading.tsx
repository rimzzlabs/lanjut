import { createContext, type ReactNode, useContext } from "react";

/**
 * Whether résumé headings are real headings. A thumbnail is a picture of a
 * résumé, so it turns them off: a page with many thumbnails would otherwise
 * carry one `h1` per sample, which buries the page's own outline.
 */
export const ResumeHeadingsContext = createContext(true);

interface ResumeHeadingProps {
  level: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
}

export function ResumeHeading(props: ResumeHeadingProps) {
  const headings = useContext(ResumeHeadingsContext);
  const Tag = headings ? (`h${props.level}` as const) : "p";
  return <Tag className={props.className}>{props.children}</Tag>;
}
