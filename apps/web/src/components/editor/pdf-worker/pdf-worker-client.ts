import {
  type PdfJobInput,
  type PdfJobKind,
  type PdfJobOutput,
  type PdfJobResponse,
  runPdfJob,
  transferList,
} from "./pdf-jobs";

let ready: Promise<Worker | null> | null = null;

function createWorker(): Worker | null {
  if (typeof Worker === "undefined") return null;
  try {
    return new Worker(new URL("./pdf-worker.ts", import.meta.url), {
      type: "module",
      name: "lanjut-pdf",
    });
  } catch {
    return null;
  }
}

/**
 * Resolves when the worker says it is ready, and with null when it cannot
 * start, so that no job is posted to a worker that never answers.
 */
function whenReady(worker: Worker): Promise<Worker | null> {
  return new Promise((resolve) => {
    function onReady() {
      worker.removeEventListener("error", onError);
      resolve(worker);
    }
    function onError() {
      worker.removeEventListener("message", onReady);
      worker.terminate();
      resolve(null);
    }
    worker.addEventListener("message", onReady, { once: true });
    worker.addEventListener("error", onError, { once: true });
  });
}

/** The one PDF worker of the session, started on the first job. */
function pdfWorker(): Promise<Worker | null> {
  if (ready) return ready;
  const worker = createWorker();
  ready = worker ? whenReady(worker) : Promise.resolve(null);
  return ready;
}

function post<K extends PdfJobKind>(
  worker: Worker,
  kind: K,
  input: PdfJobInput<K>,
): Promise<PdfJobOutput<K>> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event: MessageEvent<PdfJobResponse>) => {
      channel.port1.close();
      if (event.data.ok) resolve(event.data.output as PdfJobOutput<K>);
      else reject(new Error(event.data.message));
    };
    worker.postMessage({ kind, input }, [
      channel.port2,
      ...transferList(input),
    ]);
  });
}

/**
 * Runs PDF work in a worker, so that the WebAssembly renderer and pdf.js never
 * block the page. Where a worker cannot start, the job runs on the page.
 * Input bytes move to the worker: read their size before the call.
 */
export async function runPdfJobInWorker<K extends PdfJobKind>(
  kind: K,
  input: PdfJobInput<K>,
): Promise<PdfJobOutput<K>> {
  const worker = await pdfWorker();
  if (!worker) return runPdfJob(kind, input);
  return post(worker, kind, input);
}
