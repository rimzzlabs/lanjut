import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { ResumeLanguage } from "@lanjut/resume";
import type { ParseResult } from "@lanjut/resume/import";
import {
  DEFAULT_TEMPLATE_ID,
  resolveTemplateId,
  SORTED_TEMPLATES,
  type TemplateId,
} from "@lanjut/resume/templates";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@lanjut/ui/components/sheet";
import { A, O, pipe, S } from "@mobily/ts-belt";
import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "use-intl";
import { useResumeCreateDraft } from "@/hooks/use-resume-create-draft";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import { useRouter } from "@/i18n/navigation";
import {
  createResumeCreateSchema,
  type ResumeCreateForm,
  type ResumeSource,
} from "@/lib/forms/resume";
import { editorHref } from "@/lib/routes";
import {
  selectActiveProfile,
  useProfileStore,
  useResumeStore,
} from "@/lib/store";
import { PlatformResumeCreateFooter } from "./platform-resume-create-footer";
import { PlatformResumeCreatePreview } from "./platform-resume-create-preview";
import { PlatformResumeCreateReview } from "./platform-resume-create-review";
import { PlatformResumeCreateStart } from "./platform-resume-create-start";
import { PlatformResumeCreateStepper } from "./platform-resume-create-stepper";
import type { CreateStep } from "./platform-resume-create-steps";
import { PlatformResumeCreateTemplate } from "./platform-resume-create-template";

const SOURCE_LABEL_KEYS: Record<ResumeSource, string> = {
  sample: "sourceSample",
  empty: "sourceEmpty",
  import: "sourceImport",
};

/** Strip an imported file's name down to a résumé title. */
function titleFromFileName(name: string): string {
  return pipe(name, S.replaceByRe(/\.(pdf|json|ya?ml)$/i, ""), S.trim) || name;
}

interface PlatformResumeCreateSheetProps {
  open: boolean;
  /** May resolve once the address reflects the change, as the URL-held state does. */
  onOpenChange: (open: boolean) => unknown;
  /** Prefills the name field. Remount (via `key`) to re-seed a new value. */
  initialTitle?: string;
  /** Preselects a template; defaults to the starter (Awal). */
  templateId?: string;
  /**
   * Preselects where the content starts. A sample or blank start opens on the
   * Template step; an import stays on Start, where the file is dropped.
   */
  initialSource?: ResumeSource;
}

/**
 * Creating a résumé in three steps: where its content starts, how it looks,
 * and its name. From the `lg` breakpoint a large preview beside the steps shows
 * every page of the résumé the flow will create, so the look is chosen on the
 * user's own content, not on a thumbnail of the sample.
 */
export function PlatformResumeCreateSheet(
  props: PlatformResumeCreateSheetProps,
) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("forms.create");
  const tv = useValidationTranslator();
  const createResume = useResumeStore((state) => state.createResume);
  const profile = useProfileStore(selectActiveProfile);
  const initialTemplate = resolveTemplateId(
    props.templateId ?? DEFAULT_TEMPLATE_ID,
  );
  const initialSource = props.initialSource ?? "sample";
  const initialStep: CreateStep =
    props.initialSource && props.initialSource !== "import"
      ? "template"
      : "start";
  const [step, setStep] = useState<CreateStep>(initialStep);
  const [templateId, setTemplateId] = useState<TemplateId>(initialTemplate);
  const [parsing, setParsing] = useState(false);
  const [imported, setImported] = useState<ParseResult | null>(null);
  const startHeading = useRef<HTMLHeadingElement>(null);
  const templateHeading = useRef<HTMLHeadingElement>(null);
  const schema = useMemo(() => createResumeCreateSchema(tv), [tv]);
  const defaultValues: ResumeCreateForm = {
    title: props.initialTitle ?? "",
    source: initialSource,
  };
  const form = useForm<ResumeCreateForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues,
    mode: "onChange",
  });
  const source = form.watch("source");
  const draft = useResumeCreateDraft(source, imported);
  const importIncomplete = source === "import" && (!imported || parsing);
  const templateName = pipe(
    SORTED_TEMPLATES,
    A.find((template) => template.id === templateId),
    O.map((template) => template.name),
    O.getWithDefault<string>(templateId),
  );

  // Each step stays mounted while hidden, so an imported file and the carousel
  // position survive a trip back. Focus follows the step, so a screen reader
  // announces it and the keyboard lands where the work is.
  function goToStep(next: CreateStep) {
    flushSync(() => setStep(next));
    if (next === "review") {
      form.setFocus("title");
      return;
    }
    const heading = next === "start" ? startHeading : templateHeading;
    heading.current?.focus();
  }

  function reset() {
    setStep(initialStep);
    setTemplateId(initialTemplate);
    setParsing(false);
    setImported(null);
    form.reset(defaultValues);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const resume = await createResume(values.title, {
      templateId,
      source: values.source,
      imported: imported ?? undefined,
      language: locale as ResumeLanguage,
      profile,
    });
    // Close first, so the library's history entry loses `?create=true` before
    // the editor's entry is pushed. Back then returns to a closed sheet.
    await props.onOpenChange(false);
    router.push(editorHref(resume.id));
  });

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      onOpenChangeComplete={(open) => {
        if (!open) reset();
      }}
    >
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none lg:data-[side=right]:w-[min(76rem,94vw)]">
        <SheetHeader className="gap-3 border-b pr-14">
          <div className="flex flex-col gap-1">
            <SheetTitle>{t("title")}</SheetTitle>
            <SheetDescription>{t("description")}</SheetDescription>
          </div>
          <PlatformResumeCreateStepper current={step} onStepChange={goToStep} />
        </SheetHeader>

        <form
          onSubmit={onSubmit}
          className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto]"
        >
          <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
            <ScrollArea className="min-h-0">
              <div className="p-4 lg:p-6">
                <div hidden={step !== "start"}>
                  <PlatformResumeCreateStart
                    control={form.control}
                    source={source}
                    headingRef={startHeading}
                    onSourceChange={(next) => {
                      if (next !== "import") setImported(null);
                    }}
                    onParsingChange={setParsing}
                    onParsed={(file, result) => {
                      setImported(result);
                      if (!form.formState.dirtyFields.title) {
                        form.setValue("title", titleFromFileName(file.name), {
                          shouldValidate: true,
                        });
                      }
                    }}
                    onCleared={() => setImported(null)}
                  />
                </div>
                <div hidden={step !== "template"}>
                  <PlatformResumeCreateTemplate
                    value={templateId}
                    onValueChange={setTemplateId}
                    preview={draft}
                    headingRef={templateHeading}
                  />
                </div>
                <div hidden={step !== "review"}>
                  <PlatformResumeCreateReview
                    control={form.control}
                    sourceLabel={t(SOURCE_LABEL_KEYS[source])}
                    templateName={templateName}
                    onEditSource={() => goToStep("start")}
                    onEditTemplate={() => goToStep("template")}
                    preview={draft}
                    template={templateId}
                  />
                </div>
              </div>
            </ScrollArea>

            <PlatformResumeCreatePreview draft={draft} template={templateId} />
          </div>

          <PlatformResumeCreateFooter
            step={step}
            canAdvance={!importIncomplete}
            submitting={form.formState.isSubmitting}
            onCancel={() => props.onOpenChange(false)}
            onStepChange={goToStep}
          />
        </form>
      </SheetContent>
    </Sheet>
  );
}
