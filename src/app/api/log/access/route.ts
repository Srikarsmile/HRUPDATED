import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { getClientIp } from "@/lib/net";
import { requireAuth } from "@/lib/auth";
import { strict as rateStrict, standard as rateStandard } from "@/lib/rate";
import { parseJson, parseQuery, z } from "@/lib/validate";
import { captureError } from "@/lib/monitoring";

export async function POST(req: Request) {
  try {
    await rateStrict("log:access:post");
    const { userId } = await requireAuth();
    const ip = await getClientIp();
    const body = await req.json().catch(() => ({} as any));
    const { path } = parseJson(body, z.object({ path: z.string().default("/dashboard") }));
    const { error } = await supabase
      .from("access_logs")
      .insert({ user_id: userId, ip, path });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    captureError(e, { route: 'log/access:post' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await rateStandard("log:access:get");
    const url = new URL(req.url);
    const qp = parseQuery(url.searchParams, z.object({ limit: z.string().optional() }));
    const limit = Math.min(parseInt(qp.limit || "200", 10), 1000);
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
    captureError(e, { route: 'log/access:get' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
