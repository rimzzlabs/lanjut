/** The title and hairline rule above a platform page's toolbar. */
export function PlatformPageHeader(props: { title: string }) {
  return (
    <header className="border-b border-border pb-4">
      <h1 className="text-xl font-semibold tracking-tight">{props.title}</h1>
    </header>
  );
}
