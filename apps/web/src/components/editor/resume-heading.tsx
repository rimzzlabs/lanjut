import { cn } from "@lanjut/ui/lib/utils";
import { createContext, type ReactNode, useContext } from "react";

/**
 * Whether a résumé's structure is real: its headings and its entries as
 * `article`. A thumbnail is a picture of a résumé, so it turns them off: a
 * page of samples would otherwise carry one `h1` per sample, and text
 * extractors would take the sample's entries as the page's main content.
 */
export const ResumeHeadingsContext = createContext(true);

// The name is the one level-1 heading, and every level-2 heading names a
// section, so each takes the color of its part (see resumeColorAttributes).
const INK: Record<ResumeHeadingProps["level"], string | undefined> = {
  1: "resume-name-ink",
  2: "resume-heading-ink",
  3: undefined,
};

interface ResumeHeadingProps {
  level: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
}

export function ResumeHeading(props: ResumeHeadingProps) {
  const headings = useContext(ResumeHeadingsContext);
  const Tag = headings ? (`h${props.level}` as const) : "p";
  return (
    <Tag className={cn(INK[props.level], props.className)}>
      {props.children}
    </Tag>
  );
}

interface ResumeArticleProps {
  className?: string;
  children: ReactNode;
}

export function ResumeArticle(props: ResumeArticleProps) {
  const real = useContext(ResumeHeadingsContext);
  const Tag = real ? "article" : "div";
  return <Tag className={props.className}>{props.children}</Tag>;
}
