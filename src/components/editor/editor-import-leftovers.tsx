"use client";

import { Check, ClipboardCopy, Inbox } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useImportLeftovers } from "@/hooks/use-import-leftovers";
import { useResumeStore } from "@/lib/store";

/**
 * Surfaces the text a PDF import could not place, but only when there is any.
 * Opens a dialog (drawer on mobile) where each chunk can be copied out and the
 * whole set dismissed once the user is done.
 */
export function EditorImportLeftovers() {
  const resumeId = useResumeStore((state) => state.open?.id);
  const { items, clear } = useImportLeftovers(resumeId);
  const t = useTranslations("editor.leftovers");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  if (items.length === 0) return null;

  const copy = async (index: number, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied((c) => (c === index ? null : c)), 1500);
  };

  return (
    <div className="px-4 pb-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Inbox /> {t("button", { count: items.length })}
      </Button>

      <ResponsiveDialog open={open} onOpenChange={setOpen}>
        <ResponsiveDialogContent className="sm:max-w-lg">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{t("title")}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="text-balance">
              {t("description")}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {items.map((item, index) => (
              <li
                key={`${index}:${item.slice(0, 40)}`}
                className="flex items-start gap-2 rounded-lg border p-2.5"
              >
                <p className="min-w-0 flex-1 text-sm wrap-break-word whitespace-pre-wrap">
                  {item}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => copy(index, item)}
                >
                  {copied === index ? <Check /> : <ClipboardCopy />}
                  <span className="sr-only">{t("copy")}</span>
                </Button>
              </li>
            ))}
          </ul>

          <ResponsiveDialogFooter className="mt-4">
            <ResponsiveDialogClose type="button" variant="outline">
              {t("close")}
            </ResponsiveDialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                await clear();
                setOpen(false);
              }}
            >
              {t("dismiss")}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
