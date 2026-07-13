import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { Resume } from "@/lib/resume";

const DB_NAME = "lanjut";

/**
 * IndexedDB structural version. Governs object stores and indexes ONLY; document
 * field-shape changes are versioned separately by the in-document schemaVersion
 * and its migration ladder (see docs/schema-migrations.md). Bump this only when
 * adding/changing a store or index, never for a field-shape change.
 *
 * v2: adds the `backups` store for raw pre-migration document snapshots.
 * v3: adds the `leftovers` store for import text that could not be placed.
 */
const DB_VERSION = 3;

/** Keys used in the single-value `app` meta store. */
export const META_KEYS = {
  lastOpenedResumeId: "lastOpenedResumeId",
} as const;

/**
 * A raw pre-migration snapshot of a résumé document, written before the first
 * read that steps it up the ladder, so a buggy or lossy migration is always
 * recoverable. Keyed by `${resumeId}@v${schemaVersion}`: one snapshot per
 * document per ladder crossing.
 */
export interface ResumeBackup {
  resumeId: string;
  schemaVersion: number;
  /** ISO 8601. */
  backedUpAt: string;
  /** The document exactly as it was persisted, before any migration ran. */
  doc: unknown;
}

/**
 * Text chunks a PDF import could not confidently place into the structured
 * document (fragments before the first heading, scrambled crumbs). Kept beside
 * the document, not inside it, so the clean structural shape is never polluted;
 * surfaced in the editor for the user to copy in or dismiss. Keyed by resumeId.
 */
export interface ImportLeftovers {
  resumeId: string;
  items: string[];
}

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
  backups: {
    key: string;
    value: ResumeBackup;
  };
  leftovers: {
    key: string;
    value: ImportLeftovers;
  };
}

let dbPromise: Promise<IDBPDatabase<LanjutDB>> | null = null;

/**
 * Lazily open the singleton database. Guarded against server rendering; this is
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
        if (!db.objectStoreNames.contains("backups")) {
          db.createObjectStore("backups");
        }
        if (!db.objectStoreNames.contains("leftovers")) {
          db.createObjectStore("leftovers", { keyPath: "resumeId" });
        }
      },
    });
  }
  return dbPromise;
}
