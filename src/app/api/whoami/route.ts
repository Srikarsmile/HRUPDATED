import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/net";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const ip = await getClientIp();
    const { role, userId } = await requireAuth();
    return NextResponse.json({ ip, role, userId });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
