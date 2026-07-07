import { User2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionPersonalForm } from "./ed-section-personal-form";

export function EditorSectionPersonal() {
  const t = useTranslations("editor.personal");

  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <User2 className="size-4" />
        {t("accordionTitle")}
      </AccordionTrigger>
      <AccordionContent>
        <EditorSectionPersonalForm />
      </AccordionContent>
    </AccordionItem>
  );
}
