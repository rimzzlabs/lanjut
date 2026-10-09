import { Badge } from "@lanjut/ui/components/badge";
import { A } from "@mobily/ts-belt";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useWatch } from "react-hook-form";
import { useTranslations } from "use-intl";
import { useSimilarIssues } from "@/hooks/use-similar-issues";
import type { FeedbackControl } from "@/lib/feedback/feedback-form";
import { ExternalLink } from "../shared/external-link";

/**
 * Issues whose titles look like the one being written, under the title field,
 * so the reporter can add to an existing issue instead of filing it twice.
 */
export function FeedbackSimilarIssues(props: { control: FeedbackControl }) {
  const t = useTranslations("feedback");
  const title = useWatch({ control: props.control, name: "title" });
  const issues = useSimilarIssues(title);

  if (A.isEmpty(issues)) return null;

  return (
    <div className="mt-1 flex flex-col gap-2 rounded-lg border bg-muted/40 p-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{t("similarTitle")}</span>
        <span className="text-xs text-muted-foreground">
          {t("similarHint")}
        </span>
      </div>
      <ul className="flex flex-col">
        {issues.map((issue) => (
          <li key={issue.number}>
            <ExternalLink
              href={issue.url}
              className="group flex items-center gap-2 rounded-sm py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                #{issue.number}
              </span>
              <span className="min-w-0 flex-1 truncate group-hover:underline">
                {issue.title}
              </span>
              <Badge variant={issue.state === "open" ? "secondary" : "outline"}>
                {t(issue.state === "open" ? "similarOpen" : "similarClosed")}
              </Badge>
              <ArrowUpRightIcon aria-hidden className="size-3.5 shrink-0" />
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
