// Written at build time by `islandMessages` (island-messages-plugin.ts).
declare module "virtual:lanjut/island-messages" {
  import type { IslandMessages } from "@lanjut/i18n/island-messages";
  import type { Locale } from "@lanjut/i18n/routing";

  export const ISLAND_MESSAGES: Record<Locale, IslandMessages>;
}
