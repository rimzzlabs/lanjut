/**
 * A card that is one link: its title link (or button) stretches over the
 * whole card with this class, and actions that sit above it lift with
 * `relative z-10`. The card must be `relative`.
 */
export const CARD_LINK =
  "block outline-none after:absolute after:inset-0 after:rounded-xl";

/** The card's hover and focus ring, drawn when its stretched link has focus. */
export const CARD_LINK_RING =
  "transition-shadow hover:ring-foreground/20 has-focus-visible:ring-3 has-focus-visible:ring-ring/50";
