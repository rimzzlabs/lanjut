import type { Metadata } from "next";
import { LandingClosure } from "@/components/landing/landing-closure";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingPreviewEditor } from "@/components/landing/landing-preview-editor";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
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
