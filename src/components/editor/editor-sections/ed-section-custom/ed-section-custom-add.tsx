"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/store";
import { EditorSectionCustomNameDialog } from "./ed-section-custom-name-dialog";

interface EditorSectionCustomAddProps {
  /** Called with the new section's id so the list can open it. */
  onAdded: (id: string) => void;
}

export function EditorSectionCustomAdd(props: EditorSectionCustomAddProps) {
  const addCustomSection = useResumeStore((state) => state.addCustomSection);
  const t = useTranslations("editor.chrome");
  const tc = useTranslations("editor.custom");
  const tcom = useTranslations("editor.common");
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 pt-4">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Plus /> <span className="sr-only">{tcom("add")} </span>
        {t("addSection")}
      </Button>

      <EditorSectionCustomNameDialog
        open={open}
        onOpenChange={setOpen}
        heading={tc("addHeading")}
        description={tc("addDescription")}
        initialValue=""
        onSubmit={(title) => props.onAdded(addCustomSection(title))}
      />
    </div>
  );
}
