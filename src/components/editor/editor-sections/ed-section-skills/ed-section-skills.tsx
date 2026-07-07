import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionSkillsForm } from "./ed-section-skills-form";

export function EditorSectionSkills() {
  const t = useTranslations("editor.skills");

  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <Sparkles className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionSkillsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
