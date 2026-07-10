import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandingClosure } from "@/components/landing/landing-closure";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingPreviewEditor } from "@/components/landing/landing-preview-editor";
import { StructuredData } from "@/components/shared/structured-data";
import { type Locale, routing } from "@/i18n/routing";
import { SITE } from "@/lib/site";

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
  const t = await getTranslations({ locale, namespace: "meta" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: SITE.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE.url,
        description: t("description"),
        inLanguage: locale,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: {
          "@type": "Person",
          name: "Rizki Citra",
          url: "https://rimzzlabs.com",
        },
      },
      {
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.url,
        inLanguage: locale,
      },
    ],
  };

  return (
    <>
      <a
        href="#main"
        className="fixed top-4 left-4 -translate-y-40 focus:translate-0 z-50 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-lg outline-none ring-2 ring-ring transition"
      >
        {tNav("skipToContent")}
      </a>

      <StructuredData json={structuredData} />
      <LandingNavbar />
      <main id="main">
        <LandingHero />
        <LandingPreviewEditor />
        <LandingHowItWorks />
        <LandingClosure />
      </main>
      <LandingFooter />
    </>
  );
}
