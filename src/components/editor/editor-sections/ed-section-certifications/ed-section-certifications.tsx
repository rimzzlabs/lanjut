import { Award } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionCertificationsForm } from "./ed-section-certifications-form";

export function EditorSectionCertifications() {
  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <Award className="size-4" /> Certifications
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionCertificationsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
