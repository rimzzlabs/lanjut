"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MonthYearMenuColumn } from "./month-year-menu-column";
import {
  formatMonthYear,
  MONTHS,
  parseMonthYear,
  YEARS,
} from "./month-year-menu-data";

interface MonthYearMenuProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function MonthYearMenu(props: MonthYearMenuProps) {
  const selected = parseMonthYear(props.value);

  const onMonth = (month: string) => {
    props.onChange(formatMonthYear(month, selected.year));
  };

  const onYear = (year: string) => {
    props.onChange(formatMonthYear(selected.month, year));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            id={props.id}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-between font-normal",
              !props.value && "text-muted-foreground",
            )}
          >
            {props.value || props.placeholder}
            <ChevronDown className="text-muted-foreground" />
          </Button>
        }
      />
      {/* Two fixed-width columns side by side; the popup sizes to their sum
          (w-auto overrides the default anchor-width) so they never overlap. */}
      <DropdownMenuContent className="flex w-auto overflow-hidden p-0">
        <MonthYearMenuColumn
          className="w-36"
          options={MONTHS}
          value={selected.month}
          onSelect={onMonth}
        />
        <div className="w-px shrink-0 bg-border" />
        <MonthYearMenuColumn
          className="w-24"
          options={YEARS}
          value={selected.year}
          onSelect={onYear}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
