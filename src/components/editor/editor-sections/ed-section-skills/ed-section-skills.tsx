import { Sparkles } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionSkillsForm } from "./ed-section-skills-form";

export function EditorSectionSkills() {
  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <Sparkles className="size-4" /> Skills
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionSkillsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
