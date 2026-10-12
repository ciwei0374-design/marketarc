import { createHmac, timingSafeEqual } from "node:crypto";

export const DEMO_ACCESS_COOKIE = "marketarc_demo_access";
const TOKEN_CONTEXT = "marketarc-demo-access-v1";

export function isDemoAccessEnabled() {
  return Boolean(process.env.DEMO_ACCESS_CODE?.trim());
}

export function createDemoAccessToken() {
  const code = process.env.DEMO_ACCESS_CODE?.trim();
  if (!code) return "";
  return createHmac("sha256", code).update(TOKEN_CONTEXT).digest("base64url");
}

export function isValidDemoAccessToken(token: string | undefined) {
  if (!isDemoAccessEnabled()) return true;
  if (!token) return false;
  const expected = createDemoAccessToken();
  const actualBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function isValidDemoAccessCode(code: string) {
  const expected = process.env.DEMO_ACCESS_CODE?.trim();
  if (!expected) return true;
  const actualBuffer = Buffer.from(code.trim());
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
