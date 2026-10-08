import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { A, O, pipe, S } from "@mobily/ts-belt";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import {
  EXPORT_FORMATS,
  type ExportFormat,
} from "@/components/editor/export-format";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import {
  createDownloadFileSchema,
  type DownloadFileForm,
} from "@/lib/forms/download";
import { Button } from "../ui/button";
import { Field, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

interface PlatformResumeDownloadFormProps {
  defaultFileName: string;
  generating: boolean;
  /**
   * Focus and select the file name on open. For a dialog only: on a page, the
   * focus jumps into the middle of the panel and scrolls it.
   */
  autoFocusFileName?: boolean;
  onSubmit: (format: ExportFormat, fileName: string) => void;
}

export function PlatformResumeDownloadForm(
  props: PlatformResumeDownloadFormProps,
) {
  const t = useTranslations("forms.download");
  const tc = useTranslations("forms.common");
  const tv = useValidationTranslator();
  const schema = useMemo(() => createDownloadFileSchema(tv), [tv]);
  const form = useForm<DownloadFileForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { format: "pdf", fileName: props.defaultFileName },
    mode: "onChange",
  });

  useEffect(() => {
    if (!props.autoFocusFileName) return;
    const frame = requestAnimationFrame(() => {
      form.setFocus("fileName", { shouldSelect: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [form, props.autoFocusFileName]);

  const onSubmit = form.handleSubmit((values) => {
    props.onSubmit(values.format, values.fileName);
  });
  const format = form.watch("format");

  return (
    <form onSubmit={onSubmit}>
      <Field>
        <FieldLabel>{t("format")}</FieldLabel>
        <Controller
          control={form.control}
          name="format"
          render={(controller) => {
            const { field } = controller;
            return (
              <ToggleGroup
                variant="outline"
                spacing={0}
                className="w-full"
                value={[field.value]}
                onValueChange={(value) => {
                  pipe(
                    value,
                    A.head,
                    O.filter(S.isNotEmpty),
                    O.tap((next) => field.onChange(next as ExportFormat)),
                  );
                }}
              >
                {EXPORT_FORMATS.map((value) => (
                  <ToggleGroupItem key={value} value={value} className="flex-1">
                    {S.toUpperCase(value)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            );
          }}
        />
      </Field>

      <Controller
        control={form.control}
        name="fileName"
        render={(controller) => {
          const { field, fieldState } = controller;
          return (
            <Field className="mt-3">
              <FieldLabel htmlFor={field.name}>{t("fileName")}</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  aria-invalid={fieldState.invalid}
                  id={field.name}
                  placeholder={t("fileNamePlaceholder")}
                  {...field}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>.{format}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          );
        }}
      />

      <Button
        type="submit"
        className="mt-3 w-full"
        disabled={props.generating || !form.formState.isValid}
      >
        {props.generating ? <Spinner /> : <DownloadSimpleIcon />}{" "}
        {tc("download")}
      </Button>
    </form>
  );
}
