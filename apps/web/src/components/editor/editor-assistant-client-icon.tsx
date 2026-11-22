import { cn } from "@lanjut/ui/lib/utils";
import { A, O } from "@mobily/ts-belt";
import { OpenAiLogoIcon, RobotIcon } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { ClaudeMarkIcon } from "@/components/shared/brand-icons";

type MarkIcon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

interface ClientMark {
  /** Matches the name that the assistant gives, such as "Claude Code" or "codex-mcp-client". */
  pattern: RegExp;
  Icon: MarkIcon;
  className?: string;
}

const CLIENT_MARKS: ReadonlyArray<ClientMark> = [
  { pattern: /claude/i, Icon: ClaudeMarkIcon, className: "text-[#d97757]" },
  { pattern: /codex|openai|chatgpt/i, Icon: OpenAiLogoIcon },
];

const ICON_CLASS = "size-3.5 shrink-0";

/** The mark of a known assistant, or a robot for any other one. */
export function EditorAssistantClientIcon(props: { client: string | null }) {
  const { client } = props;
  const mark = client
    ? A.find(CLIENT_MARKS, (item) => item.pattern.test(client))
    : O.None;

  return O.match(
    mark,
    (item) => (
      <item.Icon aria-hidden className={cn(ICON_CLASS, item.className)} />
    ),
    () => <RobotIcon aria-hidden className={ICON_CLASS} />,
  );
}
