interface ResumeSummaryBodyProps {
  body: string;
}

export function ResumeSummaryBody(props: ResumeSummaryBodyProps) {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {props.body}
    </p>
  );
}
