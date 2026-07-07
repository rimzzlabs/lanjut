import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionOrganizationsForm } from "./ed-section-organizations-form";

export function EditorSectionOrganizations() {
  const t = useTranslations("editor.organizations");

  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <Users className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionOrganizationsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
