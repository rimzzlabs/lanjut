"use client";

import { Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { useResumeStore } from "@/lib/store";
import { Button } from "../ui/button";
import { Field, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover";
import { Spinner } from "../ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

type ExportFormat = "pdf" | "docx" | "txt";

const FORMATS: ExportFormat[] = ["pdf", "docx", "txt"];

export function PlatformNavbarDownload() {
  const pathname = usePathname();
  const open = useResumeStore((state) => state.open);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [generating, setGenerating] = useState(false);

  if (!pathname.includes("/editor/")) return null;

  const onOpenChange = (next: boolean) => {
    // Prefill the name with the résumé title each time the popover opens.
    if (next && open) setFileName(open.title);
    setPopoverOpen(next);
  };

  const onDownload = async () => {
    if (!open) return;
    setGenerating(true);
    try {
      // Lazy-loaded so the heavy PDF/docx libraries stay out of the main bundle.
      const preview = resumeToPreview(open);
      if (format === "pdf") {
        const { downloadResumePdf } = await import(
          "@/components/editor/pdf/download-resume-pdf"
        );
        await downloadResumePdf(preview, fileName);
      } else if (format === "docx") {
        const { downloadResumeDocx } = await import(
          "@/components/editor/docx/download-resume-docx"
        );
        await downloadResumeDocx(preview, fileName);
      } else {
        const { downloadResumeText } = await import(
          "@/components/editor/download-resume-text"
        );
        downloadResumeText(preview, fileName);
      }
      setPopoverOpen(false);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Popover open={popoverOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger render={<Button disabled={!open} />}>
        <Download /> Download Résumé
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>Download résumé</PopoverTitle>
          <PopoverDescription>
            Pick a format and name your file.
          </PopoverDescription>
        </PopoverHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onDownload();
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
              {FORMATS.map((value) => (
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
            disabled={generating || !fileName.trim()}
          >
            {generating ? <Spinner /> : <Download />} Download
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
