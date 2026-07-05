import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PlatformResumeGridError() {
  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertTitle>Couldn&rsquo;t load your résumés</AlertTitle>
      <AlertDescription>
        Nothing was deleted — the library just failed to load from this
        browser&rsquo;s storage. Refresh the page to try again.
      </AlertDescription>
    </Alert>
  );
}
