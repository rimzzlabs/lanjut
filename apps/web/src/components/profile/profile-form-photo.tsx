import { Button } from "@lanjut/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@lanjut/ui/components/field";
import { S } from "@mobily/ts-belt";
import { ImageIcon, TrashIcon } from "@phosphor-icons/react";
import { useId, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { processPhotoFile } from "@/components/editor/editor-sections/ed-section-personal/photo-process";

interface ProfileFormPhotoProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * The profile's photo: the avatar in the app, and the header photo of each
 * new résumé. Downscaled on upload, as the editor does.
 */
export function ProfileFormPhoto(props: ProfileFormPhotoProps) {
  const t = useTranslations("editor.personal");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPhoto = S.isNotEmpty(props.value);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const processed = await processPhotoFile(file);
    if (!processed) {
      toast.error(t("photoError"));
      return;
    }
    props.onChange(processed);
  }

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>{t("photo")}</FieldLabel>
      <div className="flex items-center gap-3">
        {hasPhoto && (
          <img
            src={props.value}
            alt={t("photo")}
            width={56}
            height={56}
            className="size-14 rounded-full object-cover"
          />
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon />
          {hasPhoto ? t("photoReplace") : t("photoAdd")}
        </Button>
        {hasPhoto && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => props.onChange("")}
          >
            <TrashIcon />
            {t("photoRemove")}
          </Button>
        )}
      </div>
      <FieldDescription>{t("photoHint")}</FieldDescription>
    </Field>
  );
}
