import { Award } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionCertificationsForm } from "./ed-section-certifications-form";

export function EditorSectionCertifications() {
  const t = useTranslations("editor.certifications");

  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <Award className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionCertificationsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
