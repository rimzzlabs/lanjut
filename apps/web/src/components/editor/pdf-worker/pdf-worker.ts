import { A, O } from "@mobily/ts-belt";
import {
  type PdfJobRequest,
  type PdfJobResponse,
  runPdfJob,
  transferList,
} from "./pdf-jobs";

// The app's TypeScript program loads the DOM library, which types `self` as a
// window. In a dedicated worker, `postMessage` takes no target origin.
interface PdfWorkerScope {
  addEventListener(
    type: "message",
    listener: (event: MessageEvent<PdfJobRequest>) => void,
  ): void;
  postMessage(message: "ready"): void;
}

const scope = self as unknown as PdfWorkerScope;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

// Each request brings its own port, and the answer goes back on it.
scope.addEventListener("message", (event) => {
  const port = A.head(event.ports);
  if (O.isNone(port)) return;
  void runPdfJob(event.data.kind, event.data.input).then(
    (output) => {
      const response: PdfJobResponse = { ok: true, output };
      port.postMessage(response, transferList(output));
    },
    (error: unknown) => {
      const response: PdfJobResponse = {
        ok: false,
        message: errorMessage(error),
      };
      port.postMessage(response);
    },
  );
});

scope.postMessage("ready");
