"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { toast } from "sonner";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { useResumeStore } from "@/lib/store";
import { processPhotoFile } from "./photo-process";

const PHOTO_SIZE_MIN = 40;
const PHOTO_SIZE_MAX = 96;
const PHOTO_SIZE_DEFAULT = 56;
const PHOTO_RADIUS_MIN = 0;
const PHOTO_RADIUS_MAX = 50;

function toSingle(value: number | readonly number[]): number {
  return Array.isArray(value) ? value[0] : (value as number);
}

/**
 * Opt-in portrait control. Lives outside react-hook-form on purpose: the photo
 * is not a text field, so it reads from the store and writes through
 * updateOpen, which also makes every change undoable.
 */
export function EditorSectionPersonalPhoto() {
  const photo = useResumeStore((state) => state.open?.header.photo);
  const photoSize = useResumeStore(
    (state) => state.open?.photoSize ?? PHOTO_SIZE_DEFAULT,
  );
  const photoRadius = useResumeStore((state) => state.open?.photoRadius ?? 0);
  const photoAlign = useResumeStore((state) => state.open?.photoAlign ?? "top");
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.personal");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const processed = await processPhotoFile(file);
    if (!processed) {
      toast.error(t("photoError"));
      return;
    }
    updateOpen((draft) => {
      draft.header.photo = processed;
    });
  }

  return (
    <Field>
      <FieldLabel htmlFor="header-photo">{t("photo")}</FieldLabel>
      <div className="flex items-center gap-3">
        {photo ? (
          <Image
            src={photo}
            alt={t("photo")}
            width={56}
            height={56}
            unoptimized
            className="size-14 object-cover"
            style={{ borderRadius: `${photoRadius}%` }}
          />
        ) : null}
        <input
          ref={inputRef}
          id="header-photo"
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
          <ImagePlus />
          {photo ? t("photoReplace") : t("photoAdd")}
        </Button>
        {photo ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              updateOpen((draft) => {
                draft.header.photo = undefined;
              })
            }
          >
            <Trash2 />
            {t("photoRemove")}
          </Button>
        ) : null}
      </div>
      {photo ? (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span
              id="photo-size-label"
              className="shrink-0 text-sm text-muted-foreground"
            >
              {t("photoSize")}
            </span>
            <Slider
              aria-labelledby="photo-size-label"
              className="max-w-36"
              value={photoSize}
              onValueChange={(value) =>
                updateOpen((draft) => {
                  draft.photoSize = toSingle(value);
                })
              }
              min={PHOTO_SIZE_MIN}
              max={PHOTO_SIZE_MAX}
              step={2}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span
              id="photo-radius-label"
              className="shrink-0 text-sm text-muted-foreground"
            >
              {t("photoRadius")}
            </span>
            <Slider
              aria-labelledby="photo-radius-label"
              className="max-w-36"
              value={photoRadius}
              onValueChange={(value) =>
                updateOpen((draft) => {
                  draft.photoRadius = toSingle(value);
                })
              }
              min={PHOTO_RADIUS_MIN}
              max={PHOTO_RADIUS_MAX}
              step={1}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span
              id="photo-align-label"
              className="shrink-0 text-sm text-muted-foreground"
            >
              {t("photoAlign")}
            </span>
            <SegmentedControl
              aria-label={t("photoAlign")}
              value={photoAlign}
              onValueChange={(value) =>
                updateOpen((draft) => {
                  draft.photoAlign = value as "top" | "center" | "bottom";
                })
              }
              items={[
                { value: "top", label: t("photoAlignTop") },
                { value: "center", label: t("photoAlignCenter") },
                { value: "bottom", label: t("photoAlignBottom") },
              ]}
            />
          </div>
        </div>
      ) : null}
      <FieldDescription>{t("photoHint")}</FieldDescription>
    </Field>
  );
}
