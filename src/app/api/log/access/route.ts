import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { getClientIp } from "@/lib/net";
import { requireAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth();
    const ip = getClientIp();
    const body = await req.json().catch(() => ({} as any));
    const path = body?.path || "/dashboard";
    const { error } = await supabase
      .from("access_logs")
      .insert({ user_id: userId, ip, path });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "200", 10), 1000);
    const { role } = await requireAuth();
    // Only HR/Admin can view logs
    if (!(role === "hr" || role === "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { data, error } = await supabase
      .from("access_logs")
      .select("id,user_id,ip,path,at")
      .order("at", { ascending: false })
      .limit(limit);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
