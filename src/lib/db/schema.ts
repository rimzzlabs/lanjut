import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { Resume } from "@/lib/resume";

const DB_NAME = "lanjut";

/**
 * IndexedDB structural version. Governs object stores and indexes ONLY — document
 * field-shape changes are versioned separately by the in-document schemaVersion
 * and its migration ladder (see ADR-0002). Bump this only when adding/changing a
 * store or index, never for a field-shape change.
 */
const DB_VERSION = 1;

/** Keys used in the single-value `app` meta store. */
export const META_KEYS = {
  lastOpenedResumeId: "lastOpenedResumeId",
} as const;

export interface LanjutDB extends DBSchema {
  resumes: {
    key: string;
    value: Resume;
    indexes: { "by-updatedAt": string };
  };
  /** Small key/value store for app pointers such as lastOpenedResumeId. */
  app: {
    key: string;
    value: string;
  };
}

let dbPromise: Promise<IDBPDatabase<LanjutDB>> | null = null;

/**
 * Lazily open the singleton database. Guarded against server rendering — this is
 * the only persistence tier and it never leaves the browser.
 */
export function getDb(): Promise<IDBPDatabase<LanjutDB>> {
  if (typeof indexedDB === "undefined") {
    throw new Error(
      "IndexedDB is unavailable (server or unsupported environment).",
    );
  }
  if (!dbPromise) {
    dbPromise = openDB<LanjutDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("resumes")) {
          const store = db.createObjectStore("resumes", { keyPath: "id" });
          store.createIndex("by-updatedAt", "updatedAt");
        }
        if (!db.objectStoreNames.contains("app")) {
          db.createObjectStore("app");
        }
      },
    });
  }
  return dbPromise;
}
