import type { Resume, ResumeIndexEntry } from "@lanjut/resume";
import {
  resolveTemplateId,
  type TemplateSummary,
} from "@lanjut/resume/templates";
import { Badge } from "@lanjut/ui/components/badge";
import { Button } from "@lanjut/ui/components/button";
import { Spinner } from "@lanjut/ui/components/spinner";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { useApplyTemplate } from "@/hooks/use-apply-template";
import { Link } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { PlatformResumeCreateSheet } from "../platform-resume-create/platform-resume-create-sheet";

interface PlatformTemplatePreviewActionsProps {
  template: TemplateSummary;
  /** The saved résumé the preview wears, or undefined for the sample. */
  target: ResumeIndexEntry | undefined;
  document: Resume | null;
}

/**
 * With the sample, the template starts a new résumé. With a saved résumé, it
 * applies to that résumé, or opens it when the résumé already uses it.
 */
export function PlatformTemplatePreviewActions(
  props: PlatformTemplatePreviewActionsProps,
) {
  const t = useTranslations("platform.templates");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      {props.target && (
        <TargetAction
          template={props.template}
          target={props.target}
          document={props.document}
        />
      )}
      <Button
        variant={props.target ? "outline" : "default"}
        onClick={() => setCreateOpen(true)}
      >
        {t("use", { name: props.template.name })}
        {!props.target && <ArrowRightIcon data-icon="inline-end" />}
      </Button>

      <PlatformResumeCreateSheet
        key={props.template.id}
        templateId={props.template.id}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}

function TargetAction(props: {
  template: TemplateSummary;
  target: ResumeIndexEntry;
  document: Resume | null;
}) {
  const t = useTranslations("platform");
  const applyTemplate = useApplyTemplate();
  const [applying, setApplying] = useState(false);
  const inUse =
    props.document !== null &&
    resolveTemplateId(props.document.templateId) === props.template.id;

  if (inUse) {
    return (
      <>
        <Badge variant="secondary" className="gap-1">
          <CheckIcon weight="bold" />
          {t("templates.inUse")}
        </Badge>
        <Button
          nativeButton={false}
          render={<Link href={editorHref(props.target.id)} />}
        >
          <span className="max-w-48 truncate">
            {t("grid.open", { title: props.target.title })}
          </span>
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </>
    );
  }

  return (
    <Button
      disabled={!props.document || applying}
      onClick={async () => {
        setApplying(true);
        await applyTemplate(props.target.id, props.template.id);
      }}
    >
      <span className="max-w-48 truncate">
        {t("templates.applyTo", { title: props.target.title })}
      </span>
      {applying && <Spinner data-icon="inline-end" />}
      {!applying && <ArrowRightIcon data-icon="inline-end" />}
    </Button>
  );
}
