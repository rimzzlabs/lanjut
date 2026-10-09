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

/**
 * Search and the create action of the library. While the library's code
 * loads, it renders without the sheet (`withSheet={false}`): the button still
 * sets the address, and the library opens the sheet when it arrives.
 */
export function PlatformResumeToolbar(props: { withSheet: boolean }) {
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

      {props.withSheet && (
        <PlatformResumeCreateSheet open={open} onOpenChange={setOpen} />
      )}
    </div>
  );
}
