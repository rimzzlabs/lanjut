import { BriefcaseBusiness } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionExperienceForm } from "./ed-section-experience-form";

export function EditorSectionExperience() {
  const t = useTranslations("editor.experience");

  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <BriefcaseBusiness className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionExperienceForm />
      </AccordionContent>
    </AccordionItem>
  );
}
