import { RadioCard } from "@lanjut/ui/components/radio-card";
import { RadioGroup } from "@lanjut/ui/components/radio-group";
import {
  BugIcon,
  CheckIcon,
  type Icon,
  LightbulbIcon,
  TranslateIcon,
} from "@phosphor-icons/react";
import { Controller } from "react-hook-form";
import { useTranslations } from "use-intl";
import type { FeedbackControl } from "@/lib/feedback/feedback-form";
import {
  FEEDBACK_KINDS,
  type FeedbackKind,
} from "@/lib/feedback/feedback-schema";
import { FeedbackAccountField } from "./feedback-account-field";

const KIND_ICONS: Record<FeedbackKind, Icon> = {
  bug: BugIcon,
  idea: LightbulbIcon,
  wording: TranslateIcon,
};

/**
 * Step one: what kind of report it is, then whether the reporter has a
 * GitHub account. Each kind card says what belongs there, with an example,
 * so a broken import is not filed as an idea.
 */
export function FeedbackKindStep(props: {
  control: FeedbackControl;
  /** Off when only the GitHub path exists, so there is nothing to ask. */
  askAccount: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      <FeedbackKindChoice control={props.control} />
      {props.askAccount && <FeedbackAccountField control={props.control} />}
    </div>
  );
}

function FeedbackKindChoice(props: { control: FeedbackControl }) {
  const t = useTranslations("feedback");

  return (
    <Controller
      control={props.control}
      name="kind"
      render={(controller) => {
        const { field } = controller;
        return (
          <RadioGroup
            aria-label={t("kindLabel")}
            value={field.value}
            onValueChange={(value) => field.onChange(value as FeedbackKind)}
            className="gap-3"
          >
            {FEEDBACK_KINDS.map((kind) => (
              <FeedbackKindCard key={kind} kind={kind} />
            ))}
          </RadioGroup>
        );
      }}
    />
  );
}

/**
 * The icon box sits 13px inside the card (12px padding and the 1px border),
 * so `rounded-sm` keeps it concentric with the card's `rounded-xl`.
 */
function FeedbackKindCard(props: { kind: FeedbackKind }) {
  const t = useTranslations("feedback.kinds");
  const KindIcon = KIND_ICONS[props.kind];

  return (
    <RadioCard value={props.kind} className="flex-row items-start gap-3 p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-sm border bg-muted/60 text-muted-foreground transition-colors group-data-checked/radio-card:border-primary/30 group-data-checked/radio-card:bg-primary/10 group-data-checked/radio-card:text-primary">
        <KindIcon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
        <span className="text-sm font-medium">{t(`${props.kind}.title`)}</span>
        <span className="text-xs text-muted-foreground">
          {t(`${props.kind}.description`)}
        </span>
      </span>
      <CheckIcon
        weight="bold"
        className="mt-1 size-4 shrink-0 text-primary opacity-0 transition-opacity group-data-checked/radio-card:opacity-100"
      />
    </RadioCard>
  );
}
