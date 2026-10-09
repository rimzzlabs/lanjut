import type { Profile } from "@lanjut/resume";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@lanjut/ui/components/alert-dialog";
import { Button } from "@lanjut/ui/components/button";
import { Field, FieldLabel } from "@lanjut/ui/components/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lanjut/ui/components/select";
import { A, D, O, pipe } from "@mobily/ts-belt";
import { TrashIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { useTranslations } from "use-intl";
import { profileLabelOf, useProfileLabel } from "@/hooks/use-profile-label";
import { useProfileResumeCounts } from "@/hooks/use-profile-resumes";
import { useProfileStore } from "@/lib/store";

/** The active profile, unless it is the one going away. */
function defaultTarget(
  activeId: string,
  deletingId: string,
  others: ReadonlyArray<Profile>,
): string {
  if (activeId !== deletingId) return activeId;
  return pipe(
    others,
    A.head,
    O.mapWithDefault("", (item) => item.id),
  );
}

/**
 * Deleting a profile, behind a confirmation. Its résumés move to the profile
 * picked in the dialog (the active one when it is not this one), so nothing
 * is lost. Only the profile's own information goes away.
 */
export function ProfileDelete(props: { profile: Profile }) {
  const t = useTranslations();
  const selectId = useId();
  const label = useProfileLabel(props.profile);
  const profiles = useProfileStore((state) => state.profiles);
  const activeId = useProfileStore((state) => state.activeId);
  const removeProfile = useProfileStore((state) => state.removeProfile);
  const counts = useProfileResumeCounts();
  const count = O.getWithDefault(D.get(counts, props.profile.id), 0);
  const others = A.reject(profiles, (item) => item.id === props.profile.id);
  const options = A.map(others, (item) => ({
    value: item.id,
    label: profileLabelOf(item, t("profile.guest")),
  }));
  const [target, setTarget] = useState(() =>
    defaultTarget(activeId, props.profile.id, others),
  );
  const description = t(
    count > 0 ? "profile.deleteMove" : "profile.deleteEmpty",
    { count },
  );

  return (
    <div className="@container/delete rounded-xl p-4 ring-1 ring-destructive/30">
      <div className="flex flex-col gap-3 @md/delete:flex-row @md/delete:items-center @md/delete:justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            {t("profile.deleteTitle")}
          </span>
          <span className="text-sm text-muted-foreground">
            {t("profile.deleteDescription")}
          </span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="destructive" className="shrink-0" />}
          >
            <TrashIcon data-icon="inline-start" />
            {t("profile.deleteTitle")}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("profile.deleteConfirm", { name: label })}
              </AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>

            {count > 0 && (
              <Field>
                <FieldLabel htmlFor={selectId}>
                  {t("profile.moveTo")}
                </FieldLabel>
                <Select
                  items={options}
                  value={target}
                  onValueChange={(value) => setTarget(value as string)}
                >
                  <SelectTrigger id={selectId} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>{t("forms.common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => void removeProfile(props.profile.id, target)}
              >
                {t("forms.common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
