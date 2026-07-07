import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LandingClosure } from "@/components/landing/landing-closure";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingPreviewEditor } from "@/components/landing/landing-preview-editor";
import { type Locale, routing } from "@/i18n/routing";

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;

  return {
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: {
        en: "/",
        id: "/id",
        "x-default": "/",
      },
    },
  };
}

export default async function Home(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <main>
        <LandingHero />
        <LandingPreviewEditor />
        <LandingHowItWorks />
        <LandingClosure />
      </main>
      <LandingFooter />
    </>
  );
}
