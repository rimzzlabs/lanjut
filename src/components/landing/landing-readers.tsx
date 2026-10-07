import { A, pipe, S } from "@mobily/ts-belt";
import {
  ArrowRightIcon,
  CheckIcon,
  CircleNotchIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useMemo, useRef } from "react";
import { useTranslations } from "use-intl";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { resumeToText } from "@/components/editor/resume-to-text";
import {
  type IslandProps,
  IslandProviders,
} from "@/components/shared/providers";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLandingDraftCreate } from "@/hooks/use-landing-draft-create";
import { useLandingRead } from "@/hooks/use-landing-read";
import { Link } from "@/i18n/navigation";
import {
  type LandingDraft,
  type LandingRead,
  type LandingReadReport,
  useLandingDraftStore,
} from "@/lib/store";
import { TEMPLATES, type TemplateId } from "@/lib/templates";
import { draftKey, draftToResume } from "./landing-draft-resume";
import { LandingReaderSheet, type ReaderStatus } from "./landing-reader-sheet";

const TEMPLATE_OPTIONS = A.map(TEMPLATES, (template) => ({
  value: template.id,
  label: template.name,
}));

/** The first viewport: the visitor's résumé, read by a person and a parser at once. */
export function LandingReaders(props: IslandProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <LandingReadersBoard />
    </IslandProviders>
  );
}

function LandingReadersBoard() {
  const t = useTranslations("landing");
  const draft = useLandingDraftStore((state) => state.draft);
  const template = useLandingDraftStore((state) => state.template);
  const setField = useLandingDraftStore((state) => state.setField);
  const setTemplate = useLandingDraftStore((state) => state.setTemplate);
  const { create, creating } = useLandingDraftCreate();
  const sheetRef = useRef<HTMLDivElement>(null);
  const read = useLandingRead(sheetRef, draft, template);

  const preview = useMemo(() => resumeToPreview(draftToResume(draft)), [draft]);
  const exportLines = useMemo(
    () => textLines(resumeToText(preview)),
    [preview],
  );
  const report = currentReport(read, draftKey(draft, template));

  function field(key: keyof LandingDraft) {
    return {
      value: draft[key],
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        setField(key, event.target.value),
    };
  }

  return (
    <div className="grid grid-cols-2 items-end gap-3 md:grid-cols-[1fr_1fr_1.4fr_10rem_auto]">
      <Field className="order-1 md:order-0">
        <FieldLabel htmlFor="read-first">{t("firstName")}</FieldLabel>
        <Input
          id="read-first"
          autoComplete="given-name"
          placeholder={t("firstNamePlaceholder")}
          className="h-11"
          {...field("firstName")}
        />
      </Field>
      <Field className="order-1 md:order-0">
        <FieldLabel htmlFor="read-last">{t("lastName")}</FieldLabel>
        <Input
          id="read-last"
          autoComplete="family-name"
          placeholder={t("lastNamePlaceholder")}
          className="h-11"
          {...field("lastName")}
        />
      </Field>
      <Field className="order-3 col-span-2 md:order-0 md:col-span-1">
        <FieldLabel htmlFor="read-role">{t("role")}</FieldLabel>
        <Input
          id="read-role"
          autoComplete="organization-title"
          placeholder={t("rolePlaceholder")}
          className="h-11"
          {...field("jobTitle")}
        />
      </Field>
      <Field className="order-3 col-span-2 md:order-0 md:col-span-1">
        <FieldLabel htmlFor="read-look">{t("look")}</FieldLabel>
        <Select
          items={TEMPLATE_OPTIONS}
          value={template}
          onValueChange={(value) => setTemplate(value as TemplateId)}
        >
          <SelectTrigger
            id="read-look"
            className="w-full data-[size=default]:h-11"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {TEMPLATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Button
        size="lg"
        className="order-3 col-span-2 h-11 gap-2 px-5 md:order-0 md:col-span-1"
        disabled={creating}
        onClick={() => void create()}
      >
        {t("cta")}
        <ArrowRightIcon />
      </Button>

      <div className="order-2 col-span-2 mt-4 mb-4 md:order-0 md:col-span-5 md:mt-5 md:mb-0">
        <p
          aria-hidden
          className="mb-2 flex justify-between gap-3 text-xs text-muted-foreground sm:hidden"
        >
          <span>{t("humanLabel")}</span>
          <span className="font-machine text-foreground">
            {t("machineLabel")}
          </span>
        </p>
        <LandingReaderSheet
          sheetRef={sheetRef}
          preview={preview}
          template={template}
          lines={report?.lines ?? exportLines}
          status={readerStatus(read)}
          chars={report?.chars ?? null}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <LandingReaderChecks
            report={report}
            reading={read.status === "reading"}
          />
          <p className="text-sm text-muted-foreground">
            {t("sampleNote")} {t("noAccount")}{" "}
            <Link
              href="/platform/template"
              className="rounded-xs text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t("allTemplates")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function textLines(text: string): ReadonlyArray<string> {
  return pipe(
    text,
    S.split("\n"),
    A.filter((line) => S.isNotEmpty(S.trim(line))),
  );
}

function currentReport(read: LandingRead, key: string) {
  if (read.status === "done" && read.key === key) return read.report;
  if (read.status === "reading") return read.last;
  if (read.status === "done") return read.report;
  return null;
}

function readerStatus(read: LandingRead): ReaderStatus {
  if (read.status === "done") return "done";
  if (read.status === "failed") return "fallback";
  return "reading";
}

function LandingReaderChecks(props: {
  report: LandingReadReport | null;
  reading: boolean;
}) {
  const t = useTranslations("landing");
  const tUi = useTranslations("ui");
  const checks = [
    { label: t("checkName"), ok: props.report?.nameFound },
    { label: t("checkRole"), ok: props.report?.titleFound },
    { label: t("checkEmail"), ok: props.report?.emailFound },
    { label: t("checkOrder"), ok: props.report?.orderOk },
  ];

  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-machine text-xs">
      {checks.map((check) => (
        <li key={check.label} className="flex items-center gap-1.5">
          <CheckMark ok={check.ok} reading={props.reading} />
          <span className="text-muted-foreground">{check.label}</span>
          <span className="sr-only">
            {checkState(check.ok, props.reading, {
              pending: t("reading"),
              done: tUi("done"),
              failed: tUi("notDone"),
            })}
          </span>
        </li>
      ))}
    </ul>
  );
}

function checkState(
  ok: boolean | undefined,
  reading: boolean,
  labels: { pending: string; done: string; failed: string },
) {
  if (ok === undefined || reading) return labels.pending;
  return ok ? labels.done : labels.failed;
}

function CheckMark(props: { ok: boolean | undefined; reading: boolean }) {
  if (props.ok === undefined || props.reading) {
    return (
      <CircleNotchIcon
        aria-hidden
        className="size-3.5 animate-spin text-muted-foreground"
      />
    );
  }
  if (props.ok) {
    return (
      <CheckIcon
        aria-hidden
        weight="bold"
        className="size-3.5 text-foreground"
      />
    );
  }
  return (
    <XIcon aria-hidden weight="bold" className="size-3.5 text-destructive" />
  );
}
