"use client";

import { Search } from "lucide-react";
import {
  useTemplateSearchQuery,
  useTemplateSort,
} from "@/hooks/use-template-search";
import type { TemplateSort } from "@/lib/templates";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SORT_OPTIONS: { value: TemplateSort; label: string }[] = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "newest", label: "Newest" },
];

export function PlatformTemplateToolbar() {
  const [query, setQuery] = useTemplateSearchQuery();
  const [sort, setSort] = useTemplateSort();

  return (
    <div className="flex items-center gap-2">
      <InputGroup className="max-w-xs">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates"
        />
      </InputGroup>

      <div className="ml-auto">
        <Select
          items={SORT_OPTIONS}
          value={sort}
          onValueChange={(value) => setSort(value as TemplateSort)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
