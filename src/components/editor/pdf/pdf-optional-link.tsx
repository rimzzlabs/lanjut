import { Link, Text } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

interface PdfOptionalLinkProps {
  href?: string;
  style?: ComponentProps<typeof Link>["style"];
  /** Wrap unlinked text in its own `Text`, for standalone rows. */
  wrapPlain?: boolean;
  children: ReactNode;
}

/** Renders `children` as a PDF link when `href` is set, else as plain text. */
export function PdfOptionalLink(props: PdfOptionalLinkProps) {
  if (props.href) {
    return (
      <Link src={props.href} style={props.style}>
        {props.children}
      </Link>
    );
  }
  if (props.wrapPlain) return <Text>{props.children}</Text>;
  return props.children;
}
