import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { UsersIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionOrganizationsForm } from "./ed-section-organizations-form";

export function EditorSectionOrganizations() {
  const t = useTranslations("editor.organizations");

  return (
    <AccordionItem value="organizations" className="relative">
      <AccordionTrigger className="items-center gap-3">
        <UsersIcon className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="organizations" />

      <AccordionContent>
        <EditorSectionOrganizationsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
