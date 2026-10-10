import { Button } from "@lanjut/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@lanjut/ui/components/field";
import { Slider } from "@lanjut/ui/components/slider";
import { cn } from "@lanjut/ui/lib/utils";
import { A, O, pipe, S } from "@mobily/ts-belt";
import { ImageIcon, TrashIcon } from "@phosphor-icons/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
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

function imageIn(transfer: DataTransfer | null): File | undefined {
  if (!transfer) return undefined;
  return pipe(
    Array.from(transfer.files),
    A.find((file) => S.startsWith(file.type, "image/")),
    O.toUndefined,
  );
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select") !== null)
  );
}

/**
 * Opt-in portrait control. Lives outside react-hook-form on purpose: the photo
 * is not a text field, so it reads from the store and writes through
 * updateOpen, which also makes every change undoable. Besides the file picker,
 * it takes an image dropped on it, or pasted while the section is open and no
 * text field has focus.
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
  const fieldRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return false;
    const processed = await processPhotoFile(file);
    if (!processed) {
      toast.error(t("photoError"));
      return false;
    }
    updateOpen((resume) => ({
      ...resume,
      header: { ...resume.header, photo: processed },
    }));
    return true;
  }

  const onPaste = useEffectEvent(async (event: ClipboardEvent) => {
    if (isTyping(event.target)) return;
    // On a phone the editor is itself a sheet, so only a dialog that does not
    // hold this field means the paste was meant for something else.
    const dialog =
      event.target instanceof Element
        ? event.target.closest('[role="dialog"], [role="alertdialog"]')
        : null;
    if (dialog && !dialog.contains(fieldRef.current)) return;
    const file = imageIn(event.clipboardData);
    if (!file) return;
    event.preventDefault();
    if (await onFile(file)) toast.success(t("photoPasted"));
  });

  useEffect(() => {
    function listener(event: ClipboardEvent) {
      void onPaste(event);
    }
    document.addEventListener("paste", listener);
    return () => document.removeEventListener("paste", listener);
  }, []);

  return (
    <Field
      ref={fieldRef}
      className={cn(
        "rounded-md transition-shadow",
        dragging && "ring-2 ring-ring/50 ring-offset-4 ring-offset-background",
      )}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void onFile(imageIn(event.dataTransfer));
      }}
    >
      <FieldLabel htmlFor="header-photo">{t("photo")}</FieldLabel>
      <div className="flex items-center gap-3">
        {Boolean(photo) && (
          <img
            src={photo}
            alt={t("photo")}
            width={56}
            height={56}
            className="size-14 object-cover"
            style={{ borderRadius: `${photoRadius}%` }}
          />
        )}
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
          <ImageIcon />
          {photo ? t("photoReplace") : t("photoAdd")}
        </Button>
        {Boolean(photo) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              updateOpen((resume) => ({
                ...resume,
                header: { ...resume.header, photo: undefined },
              }))
            }
          >
            <TrashIcon />
            {t("photoRemove")}
          </Button>
        )}
      </div>
      {Boolean(photo) && (
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
                updateOpen((resume) => ({
                  ...resume,
                  photoSize: toSingle(value),
                }))
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
                updateOpen((resume) => ({
                  ...resume,
                  photoRadius: toSingle(value),
                }))
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
                updateOpen((resume) => ({
                  ...resume,
                  photoAlign: value as "top" | "center" | "bottom",
                }))
              }
              items={[
                { value: "top", label: t("photoAlignTop") },
                { value: "center", label: t("photoAlignCenter") },
                { value: "bottom", label: t("photoAlignBottom") },
              ]}
            />
          </div>
        </div>
      )}
      <FieldDescription className="flex flex-col gap-1">
        <span>{t("photoDropHint")}</span>
        <span>{t("photoHint")}</span>
      </FieldDescription>
    </Field>
  );
}
