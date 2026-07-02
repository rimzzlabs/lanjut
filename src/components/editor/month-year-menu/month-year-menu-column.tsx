"use client";

import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Option } from "./month-year-menu-data";

interface MonthYearMenuColumnProps {
  options: Option[];
  value: string | undefined;
  onSelect: (value: string) => void;
  className?: string;
}

export function MonthYearMenuColumn(props: MonthYearMenuColumnProps) {
  return (
    <div
      className={cn(
        "flex max-h-64 flex-col overflow-y-auto p-1",
        props.className,
      )}
    >
      {/* closeOnClick=false keeps the menu open so both columns can be picked. */}
      <DropdownMenuRadioGroup
        value={props.value ?? ""}
        onValueChange={(value) => props.onSelect(String(value))}
      >
        {props.options.map((option) => (
          <DropdownMenuRadioItem
            key={option.value}
            value={option.value}
            closeOnClick={false}
          >
            <span className="truncate">{option.label}</span>
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </div>
  );
}
