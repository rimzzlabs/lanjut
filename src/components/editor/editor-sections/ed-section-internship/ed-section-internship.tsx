import { Backpack } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionInternshipForm } from "./ed-section-internship-form";

export function EditorSectionInternship() {
  const t = useTranslations("editor.internship");

  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <Backpack className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionInternshipForm />
      </AccordionContent>
    </AccordionItem>
  );
}
