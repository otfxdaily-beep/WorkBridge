import { randomBytes, createHash } from "crypto";

/**
 * We only ever store a hash of a token in the database. The raw token is
 * what goes in the cookie / email link, so a database read alone can never
 * be used to impersonate a session or replay a reset/verification link.
 */
export function generateToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
