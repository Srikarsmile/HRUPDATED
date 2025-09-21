import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth, requireAdmin } from "@/lib/auth";

// GET: list attendance days (optionally filtered), with disconnect counts
export async function GET(req: Request) {
  try {
    const { role } = await requireAuth();
    requireAdmin(role);

    const url = new URL(req.url);
    const user = url.searchParams.get("user") || undefined;
    const from = url.searchParams.get("from") || undefined; // YYYY-MM-DD
    const to = url.searchParams.get("to") || undefined; // YYYY-MM-DD
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "200", 10), 1000);

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
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// POST: upsert half_day for a specific user/day
export async function POST(req: Request) {
  try {
    const { role } = await requireAuth();
    requireAdmin(role);
    const body = await req.json();
    const { user_id, day, half_day } = body || {};
    if (!user_id || !day || typeof half_day !== "boolean") {
      return NextResponse.json({ error: "user_id, day, half_day required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("attendance_days")
      .upsert({ user_id, day, half_day }, { onConflict: "user_id,day" })
      .select()
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, item: data });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

