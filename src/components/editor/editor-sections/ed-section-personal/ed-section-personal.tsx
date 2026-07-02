import { User2 } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionPersonalForm } from "./ed-section-personal-form";

export function EditorSectionPersonal() {
  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <User2 className="size-4" />
        Personal Information
      </AccordionTrigger>
      <AccordionContent>
        <EditorSectionPersonalForm />
      </AccordionContent>
    </AccordionItem>
  );
}
