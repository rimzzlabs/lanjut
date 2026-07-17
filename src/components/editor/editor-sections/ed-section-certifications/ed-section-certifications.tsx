import { Award } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionCertificationsForm } from "./ed-section-certifications-form";

export function EditorSectionCertifications() {
  const t = useTranslations("editor.certifications");

  return (
    <AccordionItem className="relative">
      <AccordionTrigger className="items-center gap-3">
        <Award className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="certifications" />

      <AccordionContent>
        <EditorSectionCertificationsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
