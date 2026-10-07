import { BackpackIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionInternshipForm } from "./ed-section-internship-form";

export function EditorSectionInternship() {
  const t = useTranslations("editor.internship");

  return (
    <AccordionItem value="internship" className="relative">
      <AccordionTrigger className="items-center gap-3">
        <BackpackIcon className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="internship" />

      <AccordionContent>
        <EditorSectionInternshipForm />
      </AccordionContent>
    </AccordionItem>
  );
}
