import type { ParseInterchangeResult } from "@lanjut/resume/interchange";
import type { InterchangeFormat } from "@lanjut/resume/interchange/paste";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@lanjut/ui/components/alert";
import { Badge } from "@lanjut/ui/components/badge";
import { A, O, pipe, S } from "@mobily/ts-belt";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

const SHOWN_ISSUES = 3;

interface EditorPasteStatusProps {
  id: string;
  format: InterchangeFormat;
  parsed: ParseInterchangeResult | undefined;
}

/**
 * What the pasted text holds: ready to import, a syntax error, or fields
 * that do not match a résumé. It is a polite status (`output`), not an
 * alert, because it changes as the person types.
 */
export function EditorPasteStatus(props: EditorPasteStatusProps) {
  const { id, format, parsed } = props;
  return (
    <output id={id} className="block empty:hidden">
      {parsed && <PasteStatusBody format={format} parsed={parsed} />}
    </output>
  );
}

function PasteStatusBody(props: {
  format: InterchangeFormat;
  parsed: ParseInterchangeResult;
}) {
  const { format, parsed } = props;
  const t = useTranslations("editor.paste");
  const formatName = S.toUpperCase(format);

  if (parsed.ok) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">{formatName}</Badge>
        <CheckCircleIcon weight="fill" className="text-primary" />
        {t("ready")}
      </p>
    );
  }

  if (parsed.kind === "syntax") {
    return (
      <Alert variant="destructive" role="none">
        <WarningCircleIcon />
        <AlertTitle>{t("syntaxError", { format: formatName })}</AlertTitle>
        <AlertDescription className="font-mono text-xs">
          {firstLine(parsed.message)}
        </AlertDescription>
      </Alert>
    );
  }

  const more = A.length(parsed.issues) - SHOWN_ISSUES;
  return (
    <Alert variant="destructive" role="none">
      <WarningCircleIcon />
      <AlertTitle>{t("schemaError")}</AlertTitle>
      <AlertDescription>
        <ul className="flex flex-col gap-0.5">
          {A.take(parsed.issues, SHOWN_ISSUES).map((issue, index) => (
            <li key={`${index}:${issue.path}`}>
              <code className="font-mono text-xs">{issue.path}</code>:{" "}
              {issue.message}
            </li>
          ))}
        </ul>
        {more > 0 && <p>{t("moreIssues", { count: more })}</p>}
      </AlertDescription>
    </Alert>
  );
}

// A parser message can carry a code excerpt on the lines after the first,
// which the first line introduces with a colon.
function firstLine(message: string): string {
  return pipe(
    message,
    S.split("\n"),
    A.head,
    O.getWithDefault(message),
    S.replaceByRe(/:\s*$/, ""),
  );
}
