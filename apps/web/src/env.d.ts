interface ImportMetaEnv {
  readonly PUBLIC_LANJUT_TARGET: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
