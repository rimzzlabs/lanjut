import { ScrollText } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionSummaryForm } from "./ed-section-summary-form";

export function EditorSectionSummary() {
  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <ScrollText className="size-4" /> Professional Summary
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionSummaryForm />
      </AccordionContent>
    </AccordionItem>
  );
}
