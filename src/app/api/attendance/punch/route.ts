import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";
import { getClientIp, isIpAllowed, parseOfficeIps } from "@/lib/net";
import { applyHalfDayIfNeeded } from "@/lib/policy";

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const type: "in" | "out" = body?.type;
    const method: "wifi" | "gps" | "manual" = body?.method || "wifi";

    if (!type || !["in", "out"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Enforce login/logout via office Wi‑Fi
    if (method !== "wifi") {
      return NextResponse.json({ error: "Punch in/out must be via office Wi‑Fi" }, { status: 403 });
    }

    const ip = getClientIp();
    const allowed = isIpAllowed(ip, parseOfficeIps());
    if (!allowed) {
      return NextResponse.json({ error: "Not on office network", ip }, { status: 403 });
    }

    const now = new Date();
    const dayISO = now.toISOString().slice(0, 10); // YYYY-MM-DD

    const { data, error } = await supabase
      .from("attendance_logs")
      .insert({ user_id: userId, at: now.toISOString(), type, method, ip })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await applyHalfDayIfNeeded(userId, dayISO);
    return NextResponse.json({ ok: true, log: data });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
