import { NextResponse } from "next/server";
import {
  createDemoAccessToken,
  DEMO_ACCESS_COOKIE,
  isDemoAccessEnabled,
  isValidDemoAccessCode,
} from "@/lib/demo-access";

export async function POST(request: Request) {
  if (!isDemoAccessEnabled()) return NextResponse.json({ ok: true });

  let code = "";
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ error: "请输入体验码。" }, { status: 400 });
  }

  const codeValid = isValidDemoAccessCode(code);
  if (!codeValid) {
    if (process.env.NODE_ENV === "development") {
      console.log("[demo-access]", { code_valid: false, set_cookie: false, redirect_target: "/" });
    }
    return NextResponse.json({ error: "体验码不正确，请重新输入。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const requestOrigin = request.headers.get("origin");
  const cloudflareVisitor = request.headers.get("cf-visitor");
  const arrivedOverHttps =
    forwardedProtocol === "https" ||
    requestOrigin?.startsWith("https://") === true ||
    cloudflareVisitor?.includes('"scheme":"https"') === true;
  response.cookies.set(DEMO_ACCESS_COOKIE, createDemoAccessToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" || arrivedOverHttps,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  if (process.env.NODE_ENV === "development") {
    console.log("[demo-access]", { code_valid: true, set_cookie: true, redirect_target: "/" });
  }
  return response;
}
