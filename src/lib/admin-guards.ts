import "server-only";
import { requireRole } from "@/lib/auth/session";

export async function requireAdmin() {
  return requireRole("ADMIN");
}
