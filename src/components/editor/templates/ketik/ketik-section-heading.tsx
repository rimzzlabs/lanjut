interface KetikSectionHeadingProps {
  title: string;
}

export function KetikSectionHeading(props: KetikSectionHeadingProps) {
  return (
    <h2 className="border-b border-dashed border-muted-foreground/50 pb-1 font-mono text-xs font-bold uppercase">
      {props.title}
    </h2>
  );
}
