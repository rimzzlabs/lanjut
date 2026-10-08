import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { ResumeLanguage } from "@lanjut/resume";
import type { ParseResult } from "@lanjut/resume/import";
import {
  DEFAULT_TEMPLATE_ID,
  resolveTemplateId,
} from "@lanjut/resume/templates";
import { Button } from "@lanjut/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@lanjut/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@lanjut/ui/components/input-group";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import { pipe, S } from "@mobily/ts-belt";
import { PlusIcon, TextTIcon, XIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocale, useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import { useRouter } from "@/i18n/navigation";
import {
  createResumeCreateSchema,
  RESUME_TITLE_MAX_LENGTH,
  type ResumeCreateForm,
} from "@/lib/forms/resume";
import { editorHref } from "@/lib/routes";
import { useResumeStore } from "@/lib/store";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../shared/responsive-dialog";
import { ResumeImportDisclaimer } from "../shared/resume-import-disclaimer";
import { PlatformResumeImportDropzone } from "./platform-resume-import-dropzone";
import { PlatformTemplateRadioGroup } from "./platform-template-radio-group";

/** Strip an imported file's name down to a résumé title. */
function titleFromFileName(name: string): string {
  return pipe(name, S.replaceByRe(/\.(pdf|json|ya?ml)$/i, ""), S.trim) || name;
}

interface PlatformResumeCreateDialogProps {
  open: boolean;
  /** May resolve once the address reflects the change, as the URL-held state does. */
  onOpenChange: (open: boolean) => unknown;
  /** Prefills the label field. Remount (via `key`) to re-seed a new value. */
  initialTitle?: string;
  /** Presentation template for the new résumé; defaults to the starter (Awal). */
  templateId?: string;
}

export function PlatformResumeCreateDialog(
  props: PlatformResumeCreateDialogProps,
) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("forms.create");
  const tc = useTranslations("forms.common");
  const tv = useValidationTranslator();
  const createResume = useResumeStore((state) => state.createResume);
  const [templateId, setTemplateId] = useState(() =>
    resolveTemplateId(props.templateId ?? DEFAULT_TEMPLATE_ID),
  );
  const [parsing, setParsing] = useState(false);
  const [imported, setImported] = useState<ParseResult | null>(null);
  const schema = useMemo(() => createResumeCreateSchema(tv), [tv]);
  const form = useForm<ResumeCreateForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { title: props.initialTitle ?? "", source: "sample" },
    mode: "onChange",
  });
  const source = form.watch("source");

  const onSubmit = form.handleSubmit(async (values) => {
    const resume = await createResume(values.title, {
      templateId,
      source: values.source,
      imported: imported ?? undefined,
      language: locale as ResumeLanguage,
    });
    form.reset({ title: "", source: "sample" });
    setImported(null);
    // Close first, so the library's history entry loses `?create=true` before
    // the editor's entry is pushed. Back then returns to a closed dialog.
    await props.onOpenChange(false);
    router.push(editorHref(resume.id));
  });

  const importIncomplete = source === "import" && (!imported || parsing);

  return (
    <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent className="flex max-h-[calc(100dvh-3rem)] flex-col gap-4 overflow-hidden sm:max-w-lg">
        <ResponsiveDialogHeader className="md:shrink-0">
          <ResponsiveDialogTitle>{t("title")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-balance">
            {t("description")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={onSubmit}
          className="md:grid md:min-h-0 md:flex-1 md:grid-rows-[minmax(0,1fr)_auto]"
        >
          <ScrollArea className="md:-mr-2 md:min-h-0 md:pr-2">
            <FieldGroup className="py-2 px-1">
              <Controller
                control={form.control}
                name="title"
                render={(controller) => {
                  const { field, fieldState } = controller;
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="create-resume-title">
                        {t("label")}
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <TextTIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="create-resume-title"
                          maxLength={RESUME_TITLE_MAX_LENGTH}
                          placeholder={t("placeholder")}
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </InputGroup>

                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  );
                }}
              />

              <Controller
                control={form.control}
                name="source"
                render={(controller) => {
                  const { field } = controller;
                  return (
                    <Field>
                      <FieldLabel>{t("sourceLabel")}</FieldLabel>
                      <SegmentedControl
                        aria-label={t("sourceLabel")}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value !== "import") setImported(null);
                        }}
                        items={[
                          { value: "sample", label: t("sourceSample") },
                          { value: "empty", label: t("sourceEmpty") },
                          { value: "import", label: t("sourceImport") },
                        ]}
                      />
                    </Field>
                  );
                }}
              />

              {source === "import" && (
                <div className="flex flex-col gap-3">
                  <ResumeImportDisclaimer />
                  <PlatformResumeImportDropzone
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
              )}

              <Field>
                <FieldLabel>{t("template")}</FieldLabel>
                <PlatformTemplateRadioGroup
                  value={templateId}
                  onValueChange={setTemplateId}
                />
              </Field>
            </FieldGroup>
          </ScrollArea>

          <ResponsiveDialogFooter className="mt-4 border-t pt-4 md:shrink-0">
            <ResponsiveDialogClose type="button" variant="outline">
              <XIcon /> {tc("cancel")}
            </ResponsiveDialogClose>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || importIncomplete}
            >
              <PlusIcon />
              {t("submit")}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
