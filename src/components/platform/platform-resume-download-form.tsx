"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import {
  EXPORT_FORMATS,
  type ExportFormat,
} from "@/components/editor/download-resume";
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

/**
 * The format + file name form shared by every download surface (editor navbar
 * popover, library card dialog). Remount via `key` to re-seed the file name.
 */
export function PlatformResumeDownloadForm(
  props: PlatformResumeDownloadFormProps,
) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [fileName, setFileName] = useState(props.defaultFileName);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit(format, fileName);
      }}
    >
      <Field>
        <FieldLabel>Format</FieldLabel>
        <ToggleGroup
          variant="outline"
          spacing={0}
          className="w-full"
          value={[format]}
          onValueChange={(value) => {
            const next = value[0] as ExportFormat | undefined;
            if (next) setFormat(next);
          }}
        >
          {EXPORT_FORMATS.map((value) => (
            <ToggleGroupItem key={value} value={value} className="flex-1">
              {value.toUpperCase()}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field className="mt-3">
        <FieldLabel htmlFor="download-file-name">File name</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="download-file-name"
            value={fileName}
            placeholder="resume"
            onChange={(event) => setFileName(event.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>.{format}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </Field>

      <Button
        type="submit"
        className="mt-3 w-full"
        disabled={props.generating || !fileName.trim()}
      >
        {props.generating ? <Spinner /> : <Download />} Download
      </Button>
    </form>
  );
}
