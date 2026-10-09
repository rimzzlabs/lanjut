import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { CertificateIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionCertificationsForm } from "./ed-section-certifications-form";

export function EditorSectionCertifications() {
  const t = useTranslations("editor.certifications");

  return (
    <AccordionItem value="certifications" className="relative">
      <AccordionTrigger className="items-center gap-3">
        <CertificateIcon className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="certifications" />

      <AccordionContent>
        <EditorSectionCertificationsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
