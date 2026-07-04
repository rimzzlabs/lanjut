interface KetatSectionHeadingProps {
  title: string;
}

export function KetatSectionHeading(props: KetatSectionHeadingProps) {
  return (
    <div className="border-y border-muted-foreground/40 py-1.5">
      <h2 className="text-center font-serif text-base tracking-wide">
        {props.title}
      </h2>
    </div>
  );
}
