import type { ReactNode } from "react";

interface ResumeOptionalLinkProps {
  href?: string;
  className?: string;
  /** Wrap unlinked text in a `span`, for rows that style each item. */
  wrapPlain?: boolean;
  children: ReactNode;
}

/** Renders `children` as a link when `href` is set, else as plain text. */
export function ResumeOptionalLink(props: ResumeOptionalLinkProps) {
  if (props.href) {
    return (
      <a href={props.href} className={props.className}>
        {props.children}
      </a>
    );
  }
  if (props.wrapPlain) return <span>{props.children}</span>;
  return props.children;
}
