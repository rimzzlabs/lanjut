interface KlasikSectionHeadingProps {
  title: string;
}

export function KlasikSectionHeading(props: KlasikSectionHeadingProps) {
  return (
    <div className="border-b border-muted-foreground/40 pb-1">
      <h2 className="text-center font-serif text-sm uppercase">
        {props.title}
      </h2>
    </div>
  );
}
