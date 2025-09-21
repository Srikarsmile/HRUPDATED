import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// IP-based redirect: HR -> /admin when visiting /dashboard
export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  if (path === "/dashboard") {
    const enabled = String(process.env.HR_REDIRECT_ENABLED || "true").toLowerCase() === "true";
    if (!enabled) {
      return NextResponse.next();
    }
    const ip = getIpFromHeaders(req);
    const hrSingle = (process.env.HR_IP || "").trim();
    const hrList = (process.env.HR_IPS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const hrSet = new Set([hrSingle, ...hrList].filter(Boolean));

    // Debug logging for development
    console.log("[MIDDLEWARE DEBUG] Detected IP:", ip);
    console.log("[MIDDLEWARE DEBUG] HR_IP:", hrSingle);
    console.log("[MIDDLEWARE DEBUG] HR_IPS:", process.env.HR_IPS);
    console.log("[MIDDLEWARE DEBUG] HR Set:", Array.from(hrSet));
    console.log("[MIDDLEWARE DEBUG] IP in HR set:", hrSet.has(ip || ""));

    // In development mode, make it easier to access admin dashboard
    if (process.env.NODE_ENV === "development") {
      // Allow access to admin dashboard if IP matches OR if accessing with ?admin=true
      const isAdmin = hrSet.has(ip || "") || url.searchParams.get("admin") === "true";
      if (isAdmin) {
        console.log("[MIDDLEWARE DEBUG] Redirecting to admin dashboard");
        const to = new URL("/admin/rt", req.url);
        return NextResponse.redirect(to);
      }
    } else {
      // Production: strict IP checking only
      if (ip && hrSet.has(ip)) {
        const to = new URL("/admin/rt", req.url);
        return NextResponse.redirect(to);
      }
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
