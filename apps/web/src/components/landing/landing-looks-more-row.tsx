import { buttonVariants } from "@lanjut/ui/components/button";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { Link } from "@/i18n/navigation";
import { TEMPLATE_PATHNAME } from "@/lib/routes";
import { LandingLooksFan } from "./landing-looks-fan";
import { LandingLooksRowFrame } from "./landing-looks-row-frame";

interface LandingLooksMoreRowProps {
  open: boolean;
  preview: ResumePreview;
  onSelect: () => void;
}

/** The closing row: the rest of the catalog lives on the templates page. */
export function LandingLooksMoreRow(props: LandingLooksMoreRowProps) {
  const t = useTranslations("landing");

  return (
    <LandingLooksRowFrame
      open={props.open}
      onSelect={props.onSelect}
      title={t("looksMoreHeading")}
    >
      <div className="mb-4 max-w-sm lg:hidden">
        <LandingLooksFan preview={props.preview} />
      </div>
      <p className="max-w-[44ch] text-sm text-muted-foreground">
        {t("looksMoreBody")}
      </p>
      <Link
        href={TEMPLATE_PATHNAME}
        className={buttonVariants({ size: "sm", className: "mt-3" })}
      >
        {t("allTemplates")}
        <ArrowRightIcon aria-hidden />
      </Link>
    </LandingLooksRowFrame>
  );
}
