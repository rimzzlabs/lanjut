"use client";

import { Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useResumeCreateDialog } from "@/hooks/use-resume-create-dialog";
import { useResumeSearchQuery } from "@/hooks/use-resume-search";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { PlatformResumeCreateDialog } from "./platform-resume-create-dialog";

export function PlatformResumeToolbar() {
  const [open, setOpen] = useResumeCreateDialog();
  const [query, setQuery] = useResumeSearchQuery();
  const t = useTranslations("platform.toolbar");

  return (
    <div className="flex items-center gap-2">
      <InputGroup id="tour-search-resume" className="max-w-xs">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchResume")}
        />
      </InputGroup>

      <nav className="inline-flex items-center gap-2 ml-auto">
        <Button id="tour-create-resume" onClick={() => setOpen(true)}>
          <Plus /> {t("resume")}
        </Button>
      </nav>

      <PlatformResumeCreateDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
