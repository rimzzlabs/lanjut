"use client";

import { Plus, Search } from "lucide-react";
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

  return (
    <div className="flex items-center gap-2">
      <InputGroup id="tour-search-resume" className="max-w-xs">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your resume"
        />
      </InputGroup>

      <nav className="inline-flex items-center gap-2 ml-auto">
        <Button id="tour-create-resume" onClick={() => setOpen(true)}>
          <Plus /> Résumé
        </Button>
      </nav>

      <PlatformResumeCreateDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
