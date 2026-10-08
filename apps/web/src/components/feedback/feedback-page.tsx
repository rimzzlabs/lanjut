import { AppProviders, type IslandProps } from "@/components/shared/providers";
import { usePageFeedbackContext } from "@/hooks/use-feedback-context";
import { useFeedbackLaunch } from "@/hooks/use-feedback-params";
import { FeedbackFlow } from "./feedback-flow";

/**
 * The standalone feedback page. The desktop app has no server of its own, so
 * it opens this page on the hosted site, where Turnstile and /api/feedback
 * work, and names the kind, the area, its build, and the résumé's look in the
 * query string. Anyone can also open it directly.
 */
export function FeedbackPage(props: IslandProps) {
  return (
    <AppProviders locale={props.locale} pathname={props.pathname}>
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <FeedbackPageFlow />
      </main>
    </AppProviders>
  );
}

function FeedbackPageFlow() {
  const launch = useFeedbackLaunch();
  const context = usePageFeedbackContext();

  return (
    <FeedbackFlow
      surface="page"
      kind={launch.kind}
      area={context.area}
      details={context.details}
    />
  );
}
