"use client";

import type { ComponentProps, MouseEvent } from "react";
import { IS_DESKTOP } from "@/lib/build-target";
import { openExternal } from "@/lib/open-external";

type ExternalLinkProps = Omit<ComponentProps<"a">, "target" | "rel">;

/**
 * An anchor that leaves the app. On the web it is an ordinary new-tab link. In
 * the desktop shell the webview would swallow the navigation, so the click is
 * handed to the operating system instead. The href stays on the element either
 * way, so the link is still copyable and readable by assistive tech.
 */
export function ExternalLink(props: ExternalLinkProps) {
  const { href, onClick, ...rest } = props;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!IS_DESKTOP || !href || event.defaultPrevented) return;
    event.preventDefault();
    void openExternal(href);
  };

  return (
    <a
      {...rest}
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
    />
  );
}
