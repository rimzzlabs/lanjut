import { BriefcaseBusiness } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionExperienceForm } from "./ed-section-experience-form";

export function EditorSectionExperience() {
  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <BriefcaseBusiness className="size-4" /> Professional Experience
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionExperienceForm />
      </AccordionContent>
    </AccordionItem>
  );
}
