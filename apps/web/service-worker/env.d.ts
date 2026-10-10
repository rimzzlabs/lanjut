// The service worker builds outside Astro, so it declares the one build value
// that its shared imports read (`src/lib/build-target.ts`).
interface ImportMetaEnv {
  readonly PUBLIC_LANJUT_TARGET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
