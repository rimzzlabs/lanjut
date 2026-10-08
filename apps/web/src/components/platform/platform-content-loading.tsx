import { Spinner } from "@lanjut/ui/components/spinner";

/** Fills the shell's content area while a page's code loads. */
export function PlatformContentLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
