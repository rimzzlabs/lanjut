import type { TemplateId } from "@lanjut/resume/templates";
import type { ComponentType } from "react";
import { ResumeBlockView } from "../resume-block-view";
import type { ResumeBlock } from "../resume-blocks";
import { AnggunBlockView } from "./anggun/anggun-block-view";
import { ElokBlockView } from "./elok/elok-block-view";
import { GarisBlockView } from "./garis/garis-block-view";
import { JurnalBlockView } from "./jurnal/jurnal-block-view";
import { KertasBlockView } from "./kertas/kertas-block-view";
import { KetatBlockView } from "./ketat/ketat-block-view";
import { KetikBlockView } from "./ketik/ketik-block-view";
import { KlasikBlockView } from "./klasik/klasik-block-view";
import { KodeBlockView } from "./kode/kode-block-view";
import { LuasaBlockView } from "./luasa/luasa-block-view";
import { LugasBlockView } from "./lugas/lugas-block-view";
import { MesinBlockView } from "./mesin/mesin-block-view";
import { PolosBlockView } from "./polos/polos-block-view";
import { RapiBlockView } from "./rapi/rapi-block-view";
import { RingkasBlockView } from "./ringkas/ringkas-block-view";
import { SegarBlockView } from "./segar/segar-block-view";
import { TebalBlockView } from "./tebal/tebal-block-view";
import { TegasBlockView } from "./tegas/tegas-block-view";
import { TengahBlockView } from "./tengah/tengah-block-view";

export type BlockViewComponent = ComponentType<{ block: ResumeBlock }>;

/**
 * Presentation-layer registry: which block renderer draws each template. All
 * templates consume the same linear `ResumeBlock` sequence (only styling
 * differs) so pagination, exports, and parse order stay identical.
 */
export const TEMPLATE_BLOCK_VIEWS: Record<TemplateId, BlockViewComponent> = {
  awal: ResumeBlockView,
  ketat: KetatBlockView,
  luasa: LuasaBlockView,
  tebal: TebalBlockView,
  klasik: KlasikBlockView,
  ketik: KetikBlockView,
  polos: PolosBlockView,
  garis: GarisBlockView,
  anggun: AnggunBlockView,
  tegas: TegasBlockView,
  segar: SegarBlockView,
  rapi: RapiBlockView,
  lugas: LugasBlockView,
  kertas: KertasBlockView,
  jurnal: JurnalBlockView,
  kode: KodeBlockView,
  mesin: MesinBlockView,
  ringkas: RingkasBlockView,
  tengah: TengahBlockView,
  elok: ElokBlockView,
};
