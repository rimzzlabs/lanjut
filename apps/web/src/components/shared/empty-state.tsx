import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@lanjut/ui/components/empty";
import type { Icon } from "@phosphor-icons/react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: Icon;
}

export function EmptyState(props: EmptyStateProps) {
  const { title, description, icon: Icon } = props;
  return (
    <Empty className="gap-1.5 rounded-lg border px-4 py-5">
      <EmptyHeader className="gap-1">
        {Icon && (
          <EmptyMedia
            variant="icon"
            className="mb-1 size-8 rounded-lg [&_svg:not([class*='size-'])]:size-4"
          >
            <Icon />
          </EmptyMedia>
        )}
        <EmptyTitle className="text-sm font-medium">{title}</EmptyTitle>
        <EmptyDescription className="text-xs">{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
