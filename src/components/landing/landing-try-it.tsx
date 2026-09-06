"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import {
  type LandingDraft,
  useLandingDraftStore,
  useResumeStore,
} from "@/lib/store";
import type { TemplateId } from "@/lib/templates";
import {
  draftFullName,
  draftHasContent,
  draftToResume,
} from "./landing-draft-resume";
import { LandingLiveResume } from "./landing-live-resume";

const TRY_TEMPLATES: TemplateId[] = ["awal", "klasik", "ketik"];

/**
 * The landing page's interactive proof: three fields, rendered instantly into
 * a real résumé by the same engine that prints the PDF. No screenshots, no
 * mockups; what the visitor sees is the product running.
 */
export function LandingTryIt() {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("tryIt");
  const router = useRouter();
  const draft = useLandingDraftStore((state) => state.draft);
  const template = useLandingDraftStore((state) => state.template);
  const setField = useLandingDraftStore((state) => state.setField);
  const setTemplate = useLandingDraftStore((state) => state.setTemplate);
  const createResume = useResumeStore((state) => state.createResume);
  const [creating, setCreating] = useState(false);

  const preview = useMemo(() => resumeToPreview(draftToResume(draft)), [draft]);

  const field = (key: keyof LandingDraft) => ({
    value: draft[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setField(key, event.target.value),
  });

  // The CTA finishes what the visitor started: their typed draft becomes the
  // created document, opened straight in the editor. An untouched form goes to
  // the dashboard instead, where the create dialog offers the full choices.
  async function onCreate() {
    if (!draftHasContent(draft)) {
      router.push("/platform");
      return;
    }
    setCreating(true);
    try {
      const resume = await createResume(
        draftFullName(draft) || t("draftTitle"),
        {
          source: "import",
          imported: { resume: draftToResume(draft), leftovers: [] },
          templateId: template,
        },
      );
      router.push(`/platform/editor/${resume.id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="mx-auto w-11/12 max-w-5xl pb-24 md:pb-32">
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl"
      >
        <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">
          {t("kicker")}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="mt-4 text-base text-foreground/70 sm:text-lg">
          {t("description")}
        </p>
      </motion.div>

      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 grid items-start gap-8 md:mt-12 md:grid-cols-12 md:gap-12"
      >
        <div className="md:col-span-5">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="try-first">{t("firstName")}</FieldLabel>
                <Input
                  id="try-first"
                  placeholder={t("firstNamePlaceholder")}
                  {...field("firstName")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="try-last">{t("lastName")}</FieldLabel>
                <Input
                  id="try-last"
                  placeholder={t("lastNamePlaceholder")}
                  {...field("lastName")}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="try-title">{t("jobTitle")}</FieldLabel>
              <Input
                id="try-title"
                placeholder={t("jobTitlePlaceholder")}
                {...field("jobTitle")}
              />
            </Field>
            <Field>
              <FieldLabel>{t("template")}</FieldLabel>
              <SegmentedControl
                aria-label={t("template")}
                value={template}
                onValueChange={(value) => setTemplate(value as TemplateId)}
                items={TRY_TEMPLATES.map((id) => ({
                  value: id,
                  label: id.charAt(0).toUpperCase() + id.slice(1),
                }))}
              />
            </Field>

            <div className="mt-2 flex flex-col gap-2">
              <Button
                size="lg"
                className="w-fit"
                disabled={creating}
                onClick={() => void onCreate()}
              >
                {t("cta")} <ArrowRight />
              </Button>
              <p className="text-xs text-muted-foreground">{t("note")}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <LandingLiveResume
            template={template}
            preview={preview}
            cropHeight={520}
          />
          <p className="mt-2 px-1 font-mono text-xs text-muted-foreground">
            {t("caption")}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
