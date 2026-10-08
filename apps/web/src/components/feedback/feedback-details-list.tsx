import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@lanjut/ui/components/field";
import { Switch } from "@lanjut/ui/components/switch";
import { A, pipe, S } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import type { FeedbackDetails } from "@/lib/feedback/feedback-schema";

const DETAIL_KEYS: ReadonlyArray<keyof FeedbackDetails> = [
  "app",
  "platform",
  "browser",
  "os",
  "language",
  "page",
  "template",
  "font",
  "documentLanguage",
];

interface FeedbackDetailsListProps {
  details: FeedbackDetails;
  included: boolean;
  onIncludedChange: (included: boolean) => void;
}

/**
 * The technical details, each one shown before it is sent, behind a switch
 * that leaves them all out. None of them is text from a résumé.
 */
export function FeedbackDetailsList(props: FeedbackDetailsListProps) {
  const t = useTranslations("feedback");
  const rows = pipe(
    DETAIL_KEYS,
    A.filter((key) => S.isNotEmpty(S.trim(props.details[key] ?? ""))),
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <Field orientation="horizontal" className="items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <FieldLabel htmlFor="feedback-include-details">
            {t("includeDetails")}
          </FieldLabel>
          <FieldDescription>{t("detailsHint")}</FieldDescription>
        </div>
        <Switch
          id="feedback-include-details"
          checked={props.included}
          onCheckedChange={props.onIncludedChange}
        />
      </Field>
      {props.included && (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-t pt-3 text-sm">
          {rows.map((key) => (
            <div key={key} className="contents">
              <dt className="text-muted-foreground">{t(`details.${key}`)}</dt>
              <dd className="truncate">{props.details[key]}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
