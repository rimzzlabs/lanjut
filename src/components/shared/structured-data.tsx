export function StructuredData(props: { json: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be emitted as a raw, non-escaped script body.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(props.json) }}
    />
  );
}
