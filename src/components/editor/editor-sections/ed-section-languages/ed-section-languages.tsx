import { Languages } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionLanguagesForm } from "./ed-section-languages-form";

export function EditorSectionLanguages() {
  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <Languages className="size-4" /> Languages
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionLanguagesForm />
      </AccordionContent>
    </AccordionItem>
  );
}
