/** The title and the one-line purpose at the top of a settings section. */
export function ProfileSettingsHeading(props: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold tracking-tight">{props.title}</h2>
      <p className="text-sm text-muted-foreground">{props.description}</p>
    </div>
  );
}
