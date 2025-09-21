import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/net";
import { requireAuth } from "@/lib/auth";
import { burst } from "@/lib/rate";

export async function GET() {
  try {
    await burst("whoami:get");
    const ip = await getClientIp();
    const { role, userId } = await requireAuth();
    return NextResponse.json({ ip, role, userId });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
