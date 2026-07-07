import type { LucideIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
}: EmptyStateProps) {
  return (
    <Empty className="gap-1.5 rounded-lg border px-4 py-5">
      <EmptyHeader className="gap-1">
        {Icon ? (
          <EmptyMedia
            variant="icon"
            className="mb-1 size-8 rounded-lg [&_svg:not([class*='size-'])]:size-4"
          >
            <Icon />
          </EmptyMedia>
        ) : null}
        <EmptyTitle className="text-sm font-medium">{title}</EmptyTitle>
        <EmptyDescription className="text-xs">{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
