import en from "../messages/en.json";
import id from "../messages/id.json";
import type { Locale } from "./routing";

export const MESSAGES: Record<Locale, typeof en> = { en, id };
