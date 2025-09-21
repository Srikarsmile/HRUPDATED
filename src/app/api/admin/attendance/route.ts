import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { parseQuery, parseJson, z } from "@/lib/validate";
import { standard as rateStandard, strict as rateStrict } from "@/lib/rate";
import { captureError } from "@/lib/monitoring";

// GET: list attendance days (optionally filtered), with disconnect counts
export async function GET(req: Request) {
  try {
    await rateStandard("admin:attendance:get");
    const { role } = await requireAuth();
    requireAdmin(role);

    const url = new URL(req.url);
    const qp = parseQuery(url.searchParams, z.object({
      user: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.string().optional(),
    }));
    const user = qp.user || undefined;
    const from = qp.from || undefined; // YYYY-MM-DD
    const to = qp.to || undefined; // YYYY-MM-DD
    const limit = Math.min(parseInt(qp.limit || "200", 10), 1000);

    let q = supabase
      .from("attendance_days")
      .select("user_id,day,half_day")
      .order("day", { ascending: false })
      .limit(limit);

    if (user) q = q.eq("user_id", user);
    if (from) q = q.gte("day", from);
    if (to) q = q.lte("day", to);

    const { data: days, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Fetch disconnects in the same range for the same users/days
    const daySet = new Set((days || []).map((d) => `${d.user_id}|${d.day}`));
    let dq = supabase
      .from("disconnect_events")
      .select("user_id,day,count")
      .order("day", { ascending: false })
      .limit(2000);
    if (user) dq = dq.eq("user_id", user);
    if (from) dq = dq.gte("day", from);
    if (to) dq = dq.lte("day", to);
    const { data: disc } = await dq;

    const discMap = new Map<string, number>();
    (disc || []).forEach((r) => discMap.set(`${r.user_id}|${r.day}`, r.count || 0));

    const items = (days || []).map((d) => ({
      user_id: d.user_id,
      day: d.day,
      half_day: d.half_day,
      disconnects: discMap.get(`${d.user_id}|${d.day}`) || 0,
    }));

    // Unique users from current result set
    const users = Array.from(new Set(items.map((i) => i.user_id)));

    return NextResponse.json({ items, users });
  } catch (e: any) {
    captureError(e, { route: 'admin/attendance:get' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// POST: upsert half_day for a specific user/day
export async function POST(req: Request) {
  try {
    await rateStrict("admin:attendance:post");
    const { role } = await requireAuth();
    requireAdmin(role);
    const { user_id, day, half_day } = parseJson(await req.json(), z.object({
      user_id: z.string().min(1),
      day: z.string().min(1),
      half_day: z.boolean(),
    }));
    const { data, error } = await supabase
      .from("attendance_days")
      .upsert({ user_id, day, half_day }, { onConflict: "user_id,day" })
      .select()
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, item: data });
  } catch (e: any) {
    captureError(e, { route: 'admin/attendance:post' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
