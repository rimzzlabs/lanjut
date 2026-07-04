import type { ComponentType } from "react";
import type { TemplateId } from "@/lib/templates";
import { ResumeBlockView } from "../resume-block-view";
import type { ResumeBlock } from "../resume-blocks";
import { KetatBlockView } from "./ketat/ketat-block-view";
import { LuasaBlockView } from "./luasa/luasa-block-view";

export type BlockViewComponent = ComponentType<{ block: ResumeBlock }>;

/**
 * Presentation-layer registry: which block renderer draws each template. All
 * templates consume the same linear `ResumeBlock` sequence — only styling
 * differs — so pagination, exports, and parse order stay identical.
 */
export const TEMPLATE_BLOCK_VIEWS: Record<TemplateId, BlockViewComponent> = {
  awal: ResumeBlockView,
  ketat: KetatBlockView,
  luasa: LuasaBlockView,
};
