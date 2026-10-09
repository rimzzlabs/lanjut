import { FieldLegend, FieldSet } from "@lanjut/ui/components/field";
import { RadioCard } from "@lanjut/ui/components/radio-card";
import { RadioGroup } from "@lanjut/ui/components/radio-group";
import {
  GithubLogoIcon,
  type Icon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { Controller } from "react-hook-form";
import { useTranslations } from "use-intl";
import {
  FEEDBACK_ACCOUNTS,
  type FeedbackAccount,
  type FeedbackControl,
} from "@/lib/feedback/feedback-form";

const ACCOUNT_ICONS: Record<FeedbackAccount, Icon> = {
  none: PaperPlaneTiltIcon,
  github: GithubLogoIcon,
};

/**
 * Whether the reporter has a GitHub account, asked up front because it
 * decides how the report reaches GitHub: posted for them, or opened prefilled
 * for them to post, where GitHub tells them about replies.
 */
export function FeedbackAccountField(props: { control: FeedbackControl }) {
  const t = useTranslations("feedback");

  return (
    <Controller
      control={props.control}
      name="account"
      render={(controller) => {
        const { field } = controller;
        return (
          <FieldSet>
            <FieldLegend variant="label">{t("accountLabel")}</FieldLegend>
            <RadioGroup
              value={field.value}
              onValueChange={(value) =>
                field.onChange(value as FeedbackAccount)
              }
              className="grid gap-3 sm:grid-cols-2"
            >
              {FEEDBACK_ACCOUNTS.map((account) => (
                <FeedbackAccountCard key={account} account={account} />
              ))}
            </RadioGroup>
          </FieldSet>
        );
      }}
    />
  );
}

/**
 * The icon sits 13px inside the card (12px padding and the 1px border), so
 * `rounded-sm` keeps its box concentric with the card's `rounded-xl`.
 */
function FeedbackAccountCard(props: { account: FeedbackAccount }) {
  const t = useTranslations("feedback.accounts");
  const AccountIcon = ACCOUNT_ICONS[props.account];

  return (
    <RadioCard value={props.account} className="gap-2 p-3">
      <span className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-sm border bg-muted/60 text-muted-foreground transition-colors group-data-checked/radio-card:border-primary/30 group-data-checked/radio-card:bg-primary/10 group-data-checked/radio-card:text-primary">
          <AccountIcon className="size-4" />
        </span>
        <span className="text-sm font-medium">
          {t(`${props.account}.title`)}
        </span>
      </span>
      <span className="text-xs text-muted-foreground">
        {t(`${props.account}.description`)}
      </span>
    </RadioCard>
  );
}
