import type { StorageDriver } from "./types";
import { createLocalStorage } from "./local";

/**
 * Storage factory. Driver selected by STORAGE_DRIVER:
 *   - "local" (default): disk-backed, dev only
 *   - "s3":   S3-compatible object storage — added in the document-upload phase
 *             (Phase 4) with the AWS SDK; works against Hetzner Object Storage.
 */
let instance: StorageDriver | undefined;

export function getStorage(): StorageDriver {
  if (instance) return instance;

  const driver = process.env.STORAGE_DRIVER ?? "local";
  switch (driver) {
    case "local":
      instance = createLocalStorage();
      return instance;
    case "s3":
      throw new Error(
        "STORAGE_DRIVER=s3 is not wired yet. The S3-compatible driver is added " +
          "in the document-upload phase. Use STORAGE_DRIVER=local for now.",
      );
    default:
      throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
  }
}

export type { StorageDriver } from "./types";
