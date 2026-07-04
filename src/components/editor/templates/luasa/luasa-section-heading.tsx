interface LuasaSectionHeadingProps {
  title: string;
}

export function LuasaSectionHeading(props: LuasaSectionHeadingProps) {
  return (
    <h2 className="font-serif text-xs font-semibold uppercase tracking-[0.2em]">
      {props.title}
    </h2>
  );
}
