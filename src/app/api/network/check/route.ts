import { NextResponse } from "next/server";
import { getClientIp, isIpAllowed, parseOfficeIps } from "@/lib/net";
import { burst } from "@/lib/rate";

export async function GET() {
  await burst("network:check:get");
  const ip = await getClientIp();
  const allowlist = parseOfficeIps();
  const allowed = isIpAllowed(ip, allowlist);
  return NextResponse.json({ allowed, ip, allowlistSize: allowlist.length });
}
