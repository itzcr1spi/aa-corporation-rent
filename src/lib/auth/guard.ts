import "server-only";
import { auth } from "./config";

/**
 * Authoritative admin gate for server actions and route handlers. Layouts guard
 * page RENDERS, but server actions are independent POST endpoints — each one must
 * call this itself (defense in depth). Throws if not an authenticated admin.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("unauthorized");
  }
  return session.user;
}
