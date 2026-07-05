/**
 * Storage driver contract. Uploaded documents (IDs, driver's licenses) and car
 * photos go through this interface — never a provider SDK directly — so we can
 * run local disk in dev and swap to S3-compatible object storage (Hetzner Object
 * Storage / any S3 API) in production without changing feature code.
 *
 * Sensitive documents MUST be stored in a private bucket and only ever exposed
 * through short-lived signed URLs (getSignedUrl), guarded by admin auth.
 */
export interface PutObjectInput {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  /** Sensitive files must never be public. Defaults to private. */
  visibility?: "private" | "public";
}

export interface StorageDriver {
  put(input: PutObjectInput): Promise<{ key: string }>;
  /** Time-limited read URL for a private object. */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
}
