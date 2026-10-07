import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { createServer, type ViteDevServer } from "vite";
import type { renderResumePdf as RenderResumePdf } from "@/components/editor/takumi/render-resume-pdf";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

export interface TakumiRenderer {
  render: typeof RenderResumePdf;
  readFontFile: (file: string) => Promise<Uint8Array>;
  close: () => Promise<void>;
}

/**
 * Loads the Takumi PDF renderer through Vite, the way the app bundles it, so
 * the stylesheet it imports with `?inline` is compiled by Tailwind exactly as
 * in the browser build.
 */
export async function loadTakumiRenderer(): Promise<TakumiRenderer> {
  const server: ViteDevServer = await createServer({
    root: ROOT,
    configFile: false,
    logLevel: "error",
    appType: "custom",
    server: { middlewareMode: true, hmr: false },
    plugins: [tailwindcss()],
    resolve: { alias: { "@": `${ROOT}src` } },
    define: { "import.meta.env.PUBLIC_LANJUT_TARGET": JSON.stringify("") },
  });
  const module = await server.ssrLoadModule(
    "/src/components/editor/takumi/render-resume-pdf.ts",
  );
  return {
    render: module.renderResumePdf,
    readFontFile: async (file) =>
      new Uint8Array(await readFile(`${ROOT}public/fonts/${file}`)),
    close: () => server.close(),
  };
}
