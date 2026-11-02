import { Button } from "@lanjut/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lanjut/ui/components/tooltip";
import { DownloadSimpleIcon, SquaresFourIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export interface OsLabel {
  os: string;
  label: string;
}

export interface SecondaryActionsProps {
  templatesHref: string;
  templatesLabel: string;
  downloadHref: string;
  downloadLabels: ReadonlyArray<OsLabel>;
}

/**
 * The templates and the download as icon buttons with a tooltip, beside a
 * labeled primary action. The download name says the visitor's system through
 * `data-os-only`, in the tooltip and for screen readers alike. It needs a
 * TooltipProvider above it.
 */
export function LandingSecondaryActions(props: SecondaryActionsProps) {
  return (
    <>
      <LandingIconAction
        href={props.templatesHref}
        label={props.templatesLabel}
      >
        <SquaresFourIcon />
      </LandingIconAction>
      <LandingIconAction
        href={props.downloadHref}
        label={<OsLabels labels={props.downloadLabels} />}
      >
        <DownloadSimpleIcon />
      </LandingIconAction>
    </>
  );
}

interface LandingIconActionProps {
  href: string;
  label: ReactNode;
  children: ReactNode;
}

function LandingIconAction(props: LandingIconActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            nativeButton={false}
            // biome-ignore lint/a11y/useAnchorContent: base-ui renders the icon and the hidden label inside this anchor.
            render={<a href={props.href} />}
            variant="outline"
            size="icon"
            className="size-11"
          />
        }
      >
        {props.children}
        <span className="sr-only">{props.label}</span>
      </TooltipTrigger>
      <TooltipContent>{props.label}</TooltipContent>
    </Tooltip>
  );
}

function OsLabels(props: { labels: ReadonlyArray<OsLabel> }) {
  return (
    <>
      {props.labels.map((item) => (
        <span key={item.os} data-os-only={item.os}>
          {item.label}
        </span>
      ))}
    </>
  );
}
