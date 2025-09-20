import { NextResponse } from "next/server";
import { getClientIp, isIpAllowed, parseOfficeIps } from "@/lib/net";

export async function GET() {
  const ip = getClientIp();
  const allowlist = parseOfficeIps();
  const allowed = isIpAllowed(ip, allowlist);
  return NextResponse.json({ allowed, ip, allowlistSize: allowlist.length });
}

