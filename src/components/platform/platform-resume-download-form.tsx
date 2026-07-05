"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Download } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  EXPORT_FORMATS,
  type ExportFormat,
} from "@/components/editor/download-resume";
import {
  type DownloadFileForm,
  downloadFileSchema,
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
  onSubmit: (format: ExportFormat, fileName: string) => void;
}

export function PlatformResumeDownloadForm(
  props: PlatformResumeDownloadFormProps,
) {
  const form = useForm<DownloadFileForm>({
    resolver: standardSchemaResolver(downloadFileSchema),
    defaultValues: { format: "pdf", fileName: props.defaultFileName },
    mode: "onChange",
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      form.setFocus("fileName", { shouldSelect: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [form]);

  const onSubmit = form.handleSubmit((values) => {
    props.onSubmit(values.format, values.fileName);
  });
  const format = form.watch("format");

  return (
    <form onSubmit={onSubmit}>
      <Field>
        <FieldLabel>Format</FieldLabel>
        <Controller
          control={form.control}
          name="format"
          render={({ field }) => (
            <ToggleGroup
              variant="outline"
              spacing={0}
              className="w-full"
              value={[field.value]}
              onValueChange={(value) => {
                const next = value[0] as ExportFormat | undefined;
                if (next) field.onChange(next);
              }}
            >
              {EXPORT_FORMATS.map((value) => (
                <ToggleGroupItem key={value} value={value} className="flex-1">
                  {value.toUpperCase()}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </Field>

      <Controller
        control={form.control}
        name="fileName"
        render={({ field, fieldState }) => (
          <Field className="mt-3">
            <FieldLabel htmlFor={field.name}>File name</FieldLabel>
            <InputGroup>
              <InputGroupInput
                aria-invalid={fieldState.invalid}
                id={field.name}
                placeholder="Senior Frontend Engineer"
                {...field}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>.{format}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />

      <Button
        type="submit"
        className="mt-3 w-full"
        disabled={props.generating || !form.formState.isValid}
      >
        {props.generating ? <Spinner /> : <Download />} Download
      </Button>
    </form>
  );
}
