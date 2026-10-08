import { Button } from "@lanjut/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@lanjut/ui/components/input-group";
import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useResumeCreateSheet } from "@/hooks/use-resume-create-sheet";
import { useResumeSearchQuery } from "@/hooks/use-resume-search";
import { PlatformResumeCreateSheet } from "./platform-resume-create/platform-resume-create-sheet";

export function PlatformResumeToolbar() {
  const [open, setOpen] = useResumeCreateSheet();
  const [query, setQuery] = useResumeSearchQuery();
  const t = useTranslations("platform.toolbar");

  return (
    <div className="flex items-center gap-2">
      <InputGroup id="tour-search-resume" className="sm:w-64">
        <InputGroupAddon>
          <MagnifyingGlassIcon />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchResume")}
          aria-label={t("searchResume")}
        />
      </InputGroup>

      <Button id="tour-create-resume" onClick={() => setOpen(true)}>
        <PlusIcon /> {t("resume")}
      </Button>

      <PlatformResumeCreateSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}
