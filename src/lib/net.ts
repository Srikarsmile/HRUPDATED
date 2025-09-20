import { headers } from "next/headers";

export function getClientIp(): string | null {
  const h = headers();
  const xff = h.get("x-forwarded-for");
  if (xff) {
    // XFF may contain multiple IPs: client, proxy1, proxy2...
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xrip = h.get("x-real-ip");
  if (xrip) return xrip;
  return null;
}

export function parseOfficeIps(): string[] {
  const list = process.env.OFFICE_IPS || ""; // Comma-separated: "1.2.3.4, 5.6.0.0/16"
  return list
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidIPv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = Number(p);
    return Number.isInteger(n) && n >= 0 && n <= 255;
  });
}

function ipv4ToLong(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function cidrMatch(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/");
  const bits = parseInt(bitsStr, 10);
  if (!isValidIPv4(ip) || !isValidIPv4(range) || isNaN(bits)) return false;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  const ipLong = ipv4ToLong(ip);
  const rangeLong = ipv4ToLong(range);
  return (ipLong & mask) === (rangeLong & mask);
}

export function isIpAllowed(ip: string | null, allowlist: string[]): boolean {
  if (!ip) return false;
  // Exact match or CIDR match for IPv4
  for (const entry of allowlist) {
    if (entry.includes("/")) {
      if (cidrMatch(ip, entry)) return true;
    } else if (ip === entry) {
      return true;
    }
  }
  return false;
}

