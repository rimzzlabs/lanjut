import type { Locale } from "@lanjut/i18n/routing";
import { getTranslator } from "@lanjut/i18n/translator";
import { A } from "@mobily/ts-belt";
import { FAQ_KEYS } from "@/components/landing/landing-faq-keys";
import type { Contributor } from "./contributors";
import { absoluteUrl } from "./seo";
import { DESKTOP_RELEASE_URL, REPO_URL, SITE } from "./site";

const HOME = absoluteUrl("/");
const WEBSITE_ID = `${HOME}#website`;
const APP_ID = `${HOME}#app`;
const AUTHOR_ID = "https://rimzzlabs.com/#person";

/**
 * The home page's JSON-LD graph. `WebSite` names the site for the search
 * result (Google reads it on the home page only), the application describes
 * what Lanjut is and costs, and the FAQ repeats the questions on the page
 * so a search engine or an AI answer can quote them.
 */
export function homeStructuredData(
  locale: Locale,
  pagePath: string,
  contributors: ReadonlyArray<Contributor>,
) {
  const t = getTranslator(locale, "meta");
  const tLanding = getTranslator(locale, "landing");
  const pageUrl = absoluteUrl(pagePath);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: HOME,
        name: SITE.name,
        alternateName: ["Lanjut Resume Builder", "lanjut.org"],
        description: t("description"),
        inLanguage: ["en", "id"],
        publisher: { "@id": AUTHOR_ID },
      },
      {
        "@type": "WebApplication",
        "@id": APP_ID,
        name: SITE.name,
        url: pageUrl,
        description: t("description"),
        applicationCategory: "BusinessApplication",
        applicationSubCategory: t("category"),
        operatingSystem: "Web, macOS 13 or later",
        browserRequirements: "A current browser with JavaScript",
        featureList: t("features"),
        inLanguage: locale,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        license: "https://www.gnu.org/licenses/agpl-3.0.html",
        downloadUrl: DESKTOP_RELEASE_URL,
        screenshot: absoluteUrl(`/og/${locale}.png`),
        sameAs: [REPO_URL],
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": AUTHOR_ID },
        contributor: A.map(contributors, (contributor) => ({
          "@type": "Person",
          name: contributor.login,
          url: contributor.profileUrl,
        })),
      },
      {
        "@type": "Person",
        "@id": AUTHOR_ID,
        name: "Rizki Citra",
        url: "https://rimzzlabs.com",
        sameAs: ["https://github.com/rimzzlabs"],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        inLanguage: locale,
        mainEntity: A.map(FAQ_KEYS, (key) => ({
          "@type": "Question",
          name: tLanding(`faq.${key}.question`),
          acceptedAnswer: {
            "@type": "Answer",
            text: tLanding(`faq.${key}.answer`),
          },
        })),
      },
    ],
  };
}
