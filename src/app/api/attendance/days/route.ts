import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";
import { parseQuery, z } from "@/lib/validate";
import { standard as rateStandard } from "@/lib/rate";
import { captureError } from "@/lib/monitoring";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysInRange(from: string, to: string): string[] {
  const res: string[] = [];
  const start = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    res.push(toISODate(d));
  }
  return res;
}

export async function GET(req: Request) {
  try {
    await rateStandard("attendance:days:get");
    const { userId } = await requireAuth();
    const url = new URL(req.url);
    const qp = parseQuery(url.searchParams, z.object({ from: z.string().optional(), to: z.string().optional() }));
    let from = qp.from;
    let to = qp.to;

    // Default to current month
    if (!from || !to) {
      const now = new Date();
      const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
      from = toISODate(first);
      to = toISODate(last);
    }

    // Fetch attendance days (half-day flags)
    const [daysRes, logsRes, discRes] = await Promise.all([
      supabase
        .from("attendance_days")
        .select("day,half_day")
        .eq("user_id", userId)
        .gte("day", from)
        .lte("day", to),
      supabase
        .from("attendance_logs")
        .select("at")
        .eq("user_id", userId)
        .gte("at", new Date(from).toISOString())
        .lte("at", new Date(new Date(to).getTime() + 24 * 3600 * 1000 - 1).toISOString()),
      supabase
        .from("disconnect_events")
        .select("day,count")
        .eq("user_id", userId)
        .gte("day", from)
        .lte("day", to),
    ]);

    if (daysRes.error) return NextResponse.json({ error: daysRes.error.message }, { status: 500 });
    if (logsRes.error) return NextResponse.json({ error: logsRes.error.message }, { status: 500 });
    if (discRes.error) return NextResponse.json({ error: discRes.error.message }, { status: 500 });

    const halfMap = new Map<string, boolean>();
    (daysRes.data || []).forEach((r: any) => halfMap.set(r.day, !!r.half_day));

    const logMap = new Map<string, number>();
    (logsRes.data || []).forEach((r: any) => {
      const day = toISODate(new Date(r.at));
      logMap.set(day, (logMap.get(day) || 0) + 1);
    });

    const discMap = new Map<string, number>();
    (discRes.data || []).forEach((r: any) => discMap.set(r.day, r.count || 0));

    const items = daysInRange(from!, to!).map((d) => {
      const half = halfMap.get(d) === true;
      const hasLogs = (logMap.get(d) || 0) > 0;
      const hasDayRow = halfMap.has(d);
      const status: "present" | "half" | "absent" = half ? "half" : (hasLogs || hasDayRow) ? "present" : "absent";
      return { day: d, status, disconnects: discMap.get(d) || 0 };
    });

    return NextResponse.json({ from, to, items });
  } catch (e: any) {
    captureError(e, { route: 'attendance/days:get' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
