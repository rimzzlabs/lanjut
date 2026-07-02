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

export function PlatformNavbarDownload() {
  const pathname = usePathname();
  const open = useResumeStore((state) => state.open);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [fileName, setFileName] = useState("");
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
      // Lazy-loaded so @react-pdf stays out of the main bundle until needed.
      const { downloadResumePdf } = await import(
        "@/components/editor/pdf/download-resume-pdf"
      );
      await downloadResumePdf(resumeToPreview(open), fileName);
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
          <PopoverDescription>Name your PDF file.</PopoverDescription>
        </PopoverHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onDownload();
          }}
        >
          <Field>
            <FieldLabel htmlFor="download-file-name">File name</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="download-file-name"
                value={fileName}
                placeholder="resume"
                onChange={(event) => setFileName(event.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>.pdf</InputGroupText>
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
