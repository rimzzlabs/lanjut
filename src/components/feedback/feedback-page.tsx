import { FeedbackPanel } from "@/components/feedback/feedback-panel";
import { AppProviders, type IslandProps } from "@/components/shared/providers";

export function FeedbackPage(props: IslandProps) {
  return (
    <AppProviders locale={props.locale} pathname={props.pathname}>
      <main>
        <FeedbackPanel />
      </main>
    </AppProviders>
  );
}
