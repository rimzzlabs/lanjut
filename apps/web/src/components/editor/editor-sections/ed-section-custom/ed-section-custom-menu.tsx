import { Button } from "@lanjut/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lanjut/ui/components/dropdown-menu";
import {
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { EditorSectionCustomNameDialog } from "./ed-section-custom-name-dialog";

interface EditorSectionCustomMenuProps {
  sectionId: string;
  title: string;
}

export function EditorSectionCustomMenu(props: EditorSectionCustomMenuProps) {
  const renameCustomSection = useResumeStore(
    (state) => state.renameCustomSection,
  );
  const removeCustomSection = useResumeStore(
    (state) => state.removeCustomSection,
  );
  const t = useTranslations("editor.custom");
  const [renameOpen, setRenameOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
          <span className="sr-only">{t("menuLabel")}</span>
          <DotsThreeVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            <PencilSimpleIcon /> {t("rename")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => removeCustomSection(props.sectionId)}
          >
            <TrashIcon /> {t("remove")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditorSectionCustomNameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        heading={t("renameHeading")}
        description={t("renameDescription")}
        initialValue={props.title}
        onSubmit={(title) => renameCustomSection(props.sectionId, title)}
      />
    </>
  );
}
