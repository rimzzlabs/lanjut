import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { Resume } from "..";
import type { Profile } from "../profile";

const DB_NAME = "lanjut";

/**
 * IndexedDB structural version. Governs object stores and indexes ONLY; document
 * field-shape changes are versioned separately by the in-document schemaVersion
 * and its migration ladder (see docs/schema-migrations.md). Bump this only when
 * adding/changing a store or index, never for a field-shape change.
 *
 * v2: adds the `backups` store for raw pre-migration document snapshots.
 * v3: adds the `leftovers` store for import text that could not be placed.
 * v4: adds the `profiles` store for the pre-fill profiles.
 */
const DB_VERSION = 4;

/** Keys used in the single-value `app` meta store. */
export const META_KEYS = {
  lastOpenedResumeId: "lastOpenedResumeId",
  activeProfileId: "activeProfileId",
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
  /** Personal information and a summary that fill new résumés. */
  profiles: {
    key: string;
    value: Profile;
  };
}

let dbPromise: Promise<IDBPDatabase<LanjutDB>> | null = null;

/** Another tab on an older build holds the database open, so this tab cannot upgrade it yet. */
export const DB_BLOCKED = "blocked";
/** The database opened. Ends a `blocked` wait. */
export const DB_READY = "ready";
/** A newer build in another tab needs the database, so this tab let it go. */
export const DB_OUTDATED = "outdated";

/**
 * Connection notices for the app, as plain events, so this layer stays free
 * of React. A `DB_VERSION` bump needs every open connection on the old
 * version to close first. A tab on this build closes its own when a newer
 * build asks (`DB_OUTDATED`), and a tab that has to wait for an older build
 * says so (`DB_BLOCKED`) until the database opens (`DB_READY`).
 */
export const DB_EVENTS = new EventTarget();

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
        if (!db.objectStoreNames.contains("profiles")) {
          db.createObjectStore("profiles", { keyPath: "id" });
        }
      },
      blocked() {
        DB_EVENTS.dispatchEvent(new Event(DB_BLOCKED));
      },
      blocking(_currentVersion, _blockedVersion, event) {
        (event.target as IDBDatabase).close();
        dbPromise = null;
        DB_EVENTS.dispatchEvent(new Event(DB_OUTDATED));
      },
      terminated() {
        dbPromise = null;
      },
    }).then((db) => {
      DB_EVENTS.dispatchEvent(new Event(DB_READY));
      return db;
    });
  }
  return dbPromise;
}
