"use client";

import { LandingLiveResume } from "./landing-live-resume";

/**
 * Three templates rendering the same document live, fanned like prints on a
 * desk. Replaces the old templates screenshot.
 */
export function LandingTemplateFan() {
  return (
    <div className="grid grid-cols-3 items-start gap-3 sm:gap-4">
      <LandingLiveResume
        template="ketat"
        cropHeight={300}
        className="translate-y-4 -rotate-2"
      />
      <LandingLiveResume template="tebal" cropHeight={300} />
      <LandingLiveResume
        template="klasik"
        cropHeight={300}
        className="translate-y-4 rotate-2"
      />
    </div>
  );
}
