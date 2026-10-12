import { NextResponse, type NextRequest } from "next/server";
import { DEMO_ACCESS_COOKIE, isDemoAccessEnabled, isValidDemoAccessToken } from "@/lib/demo-access";

const ACCESS_PAGE = "/demo-access";
const ACCESS_API = "/api/demo-access";

export function proxy(request: NextRequest) {
  if (!isDemoAccessEnabled()) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname === ACCESS_PAGE || pathname === ACCESS_API) return NextResponse.next();

  const token = request.cookies.get(DEMO_ACCESS_COOKIE)?.value;
  const cookieIsValid = isValidDemoAccessToken(token);
  if (process.env.NODE_ENV === "development") {
    console.log("[demo-access]", { cookie_detected_by_proxy: Boolean(token) && cookieIsValid });
  }
  if (cookieIsValid) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessUrl = new URL(ACCESS_PAGE, request.url);
  accessUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
