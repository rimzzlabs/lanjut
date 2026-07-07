import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Uses the deprecated `middleware` (edge runtime), not Next 16's `proxy`, which
// is locked to Node.js and rejected by open-next on Cloudflare.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
