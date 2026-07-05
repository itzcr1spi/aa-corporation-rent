import { promises as fs } from "node:fs";
import path from "node:path";
import type { StorageDriver, PutObjectInput } from "./types";

/**
 * Development-only disk driver. Writes under `.storage/` at the project root.
 * NOT for production and NOT a substitute for private buckets + signed URLs —
 * it exists so uploads can be built and tested before cloud storage is wired.
 */
const ROOT = path.join(process.cwd(), ".storage");

export function createLocalStorage(): StorageDriver {
  return {
    async put({ key, body }: PutObjectInput) {
      const dest = path.join(ROOT, key);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, body);
      return { key };
    },
    async getSignedUrl(key: string) {
      // No real signing on disk — return a dev route path. Replaced by the S3
      // driver's presigned URLs in production.
      return `/api/dev-storage/${encodeURIComponent(key)}`;
    },
    async delete(key: string) {
      await fs.rm(path.join(ROOT, key), { force: true });
    },
  };
}
