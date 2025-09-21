import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";
import { parseQuery, z } from "@/lib/validate";
import { standard as rateStandard } from "@/lib/rate";
import { captureError } from "@/lib/monitoring";

export async function GET(req: Request) {
  try {
    await rateStandard("attendance:logs:get");
    const { userId } = await requireAuth();
    const url = new URL(req.url);
    const qp = parseQuery(url.searchParams, z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.string().optional(),
    }));
    const from = qp.from;
    const to = qp.to;
    const limit = Math.min(parseInt(qp.limit || "10", 10), 100);

    let q = supabase
      .from("attendance_logs")
      .select("id,at,type,method")
      .eq("user_id", userId)
      .order("at", { ascending: false })
      .limit(limit);
    if (from) q = q.gte("at", new Date(from).toISOString());
    if (to) q = q.lte("at", new Date(new Date(to).getTime() + 24 * 3600 * 1000 - 1).toISOString());
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data || [] });
  } catch (e: any) {
    captureError(e, { route: 'attendance/logs:get' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

