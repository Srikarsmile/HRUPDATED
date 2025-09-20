import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// IP-based redirect: HR -> /admin when visiting /dashboard
export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  if (path === "/dashboard") {
    const ip = getIpFromHeaders(req);
    const hrSingle = (process.env.HR_IP || "").trim();
    const hrList = (process.env.HR_IPS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const hrSet = new Set([hrSingle, ...hrList].filter(Boolean));
    if (ip && hrSet.has(ip)) {
      const to = new URL("/admin", req.url);
      return NextResponse.redirect(to);
    }
  }
  return NextResponse.next();
}

function getIpFromHeaders(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xrip = req.headers.get("x-real-ip");
  if (xrip) return xrip;
  return process.env.NODE_ENV === "development" ? "127.0.0.1" : null;
}

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
