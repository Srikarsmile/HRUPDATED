import { headers } from "next/headers";
import { getClientIp } from "@/lib/net";

export type Role = "employee" | "admin" | "hr";

// IP-based authentication and role resolution
// - If request IP matches HR_IP or is in HR_IPS (comma-separated), role = "hr"
// - Otherwise role = "employee"
// - userId is derived from IP for demo purposes
export async function requireAuth() {
  const ip = getClientIp() || inferIpFromHeaders();
  if (!ip) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const hrSingle = (process.env.HR_IP || "").trim();
  const hrList = (process.env.HR_IPS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const hrSet = new Set([hrSingle, ...hrList].filter(Boolean));

  const empList = (process.env.EMPLOYEE_IPS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const empSet = new Set(empList);

  // Optional allowlist: if EMPLOYEE_IPS is set, restrict access to union(HR_IPS, EMPLOYEE_IPS)
  if (empSet.size > 0 || hrSet.size > 0) {
    if (!(hrSet.has(ip) || empSet.has(ip))) {
      throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
  }

  const role: Role = hrSet.has(ip) ? "hr" : "employee";
  const userId = `ip:${ip}`; // use IP as user identifier for demo
  return { userId, role };
}

export function requireAdmin(role: Role) {
  if (!(role === "admin" || role === "hr")) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
}

function inferIpFromHeaders(): string | null {
  try {
    const h = headers();
    const xff = h.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]?.trim() || null;
    const xrip = h.get("x-real-ip");
    if (xrip) return xrip;
  } catch {}
  // fallback to localhost in dev
  return process.env.NODE_ENV === "development" ? "127.0.0.1" : null;
}
