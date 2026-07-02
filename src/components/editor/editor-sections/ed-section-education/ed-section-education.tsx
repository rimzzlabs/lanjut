import { GraduationCap } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionEducationForm } from "./ed-section-education-form";

export function EditorSectionEducation() {
  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <GraduationCap className="size-4" /> Education
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionEducationForm />
      </AccordionContent>
    </AccordionItem>
  );
}
