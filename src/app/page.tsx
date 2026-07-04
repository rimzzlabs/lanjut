import type { Metadata } from "next";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
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
      </main>
      <LandingFooter />
    </>
  );
}
