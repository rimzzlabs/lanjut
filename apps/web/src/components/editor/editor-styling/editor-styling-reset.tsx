import { Button } from "@lanjut/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lanjut/ui/components/tooltip";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { useResumeStore } from "@/lib/store";
import { STYLE_GROUPS, type StyleGroupId } from "./style-groups";

/**
 * Restores one styling group to its defaults. Language is content (headings,
 * dates), not styling, so no reset touches it.
 */
export function EditorStylingReset(props: {
  group: StyleGroupId;
  label: string;
}) {
  const group = STYLE_GROUPS[props.group];
  const isDefault = useResumeStore(
    (state) => state.open === null || group.isDefault(state.open),
  );
  const updateOpen = useResumeStore((state) => state.updateOpen);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isDefault}
            onClick={() => updateOpen(group.reset)}
          />
        }
      >
        <ArrowCounterClockwiseIcon />
        <span className="sr-only">{props.label}</span>
      </TooltipTrigger>
      <TooltipContent>{props.label}</TooltipContent>
    </Tooltip>
  );
}
