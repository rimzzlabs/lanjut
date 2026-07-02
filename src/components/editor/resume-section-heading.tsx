interface ResumeSectionHeadingProps {
  title: string;
}

export function ResumeSectionHeading(props: ResumeSectionHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
        {props.title}
      </h2>
      <span className="flex-1 border-t border-dotted border-muted-foreground/40" />
    </div>
  );
}
