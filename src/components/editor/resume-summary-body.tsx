interface ResumeSummaryBodyProps {
  body: string;
}

export function ResumeSummaryBody(props: ResumeSummaryBodyProps) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      {props.body}
    </p>
  );
}
