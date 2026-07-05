import { Users } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionOrganizationsForm } from "./ed-section-organizations-form";

export function EditorSectionOrganizations() {
  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <Users className="size-4" /> Organization Experience
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionOrganizationsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
