import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionOrganizationsForm } from "./ed-section-organizations-form";

export function EditorSectionOrganizations() {
  const t = useTranslations("editor.organizations");

  return (
    <AccordionItem className="relative">
      <AccordionTrigger className="items-center gap-3">
        <Users className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="organizations" />

      <AccordionContent>
        <EditorSectionOrganizationsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
