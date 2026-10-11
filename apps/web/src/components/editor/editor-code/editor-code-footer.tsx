import type { ParseInterchangeResult } from "@lanjut/resume/interchange";
import { Kbd } from "@lanjut/ui/components/kbd";
import { A, O } from "@mobily/ts-belt";
import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useCodeDraft } from "@/hooks/use-editor-mode";
import type { CodeDraft } from "@/lib/store";
import { firstLine } from "../parser-message";

export const EDITOR_CODE_STATUS_ID = "editor-code-status";
export const EDITOR_CODE_KEYS_ID = "editor-code-keys";

type InterchangeFailure = Extract<ParseInterchangeResult, { ok: false }>;

function failureSummary(failure: InterchangeFailure): string {
  if (failure.kind === "syntax") return firstLine(failure.message);
  return O.mapWithDefault(
    A.head(failure.issues),
    "",
    (issue) => `${issue.path}: ${issue.message}`,
  );
}

/** One line of fixed height, so the code does not move as the status changes. */
export function EditorCodeFooter() {
  const t = useTranslations("editor.code");
  const draft = useCodeDraft();

  return (
    <div className="flex h-9 items-center gap-3 border-t px-4 text-xs text-muted-foreground md:px-6">
      <output
        id={EDITOR_CODE_STATUS_ID}
        className="flex min-w-0 flex-1 items-center gap-1.5"
      >
        <CodeStatus draft={draft} />
      </output>
      {/* Tab does not leave this field, so the way out is said here. */}
      <p id={EDITOR_CODE_KEYS_ID} className="shrink-0 max-lg:hidden">
        {t.rich("keys", { key: (chunks) => <Kbd>{chunks}</Kbd> })}
      </p>
    </div>
  );
}

function CodeStatus(props: { draft: CodeDraft | null }) {
  const { draft } = props;
  const t = useTranslations("editor.code");

  if (draft?.parsed?.ok === false) {
    return <CodeFailure failure={draft.parsed} />;
  }
  // The first read of Markdown waits for comark to load.
  if (draft && draft.parsed === null) return t("statusPending");
  if (draft && draft.ignored > 0) {
    return (
      <>
        <InfoIcon weight="fill" className="shrink-0" />
        <span className="truncate">
          {t("ignored", { count: draft.ignored })}
        </span>
      </>
    );
  }
  return (
    <>
      <CheckCircleIcon weight="fill" className="shrink-0 text-primary" />
      {t("statusValid")}
    </>
  );
}

function CodeFailure(props: { failure: InterchangeFailure }) {
  const { failure } = props;
  const t = useTranslations("editor.code");
  const summary = failureSummary(failure);
  const more = failure.kind === "schema" ? A.length(failure.issues) - 1 : 0;

  return (
    <>
      <WarningCircleIcon weight="fill" className="shrink-0 text-destructive" />
      <span className="shrink-0 font-medium text-destructive">
        {t("statusInvalid")}
      </span>
      <span className="truncate font-mono" title={summary}>
        {summary}
      </span>
      {more > 0 && (
        <span className="shrink-0">{t("moreIssues", { count: more })}</span>
      )}
    </>
  );
}
