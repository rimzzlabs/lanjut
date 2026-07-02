interface ResumeSkillsListProps {
  items: string[];
}

export function ResumeSkillsList(props: ResumeSkillsListProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground">
      {props.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
