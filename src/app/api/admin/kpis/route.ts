import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth, requireAdmin } from "@/lib/auth";

type KPIResponse = {
  pendingLeaves: number;
  pendingRegularizations: number;
  employeesPresentToday: number;
  punchesToday: number;
  halfDaysToday: number;
  disconnectsToday: number;
  weekDisconnects: number[]; // last 7 days (oldest..today)
  weekHalfDays: number[]; // last 7 days (oldest..today)
  topDisconnects: { user_id: string; count: number }[];
};

export async function GET() {
  try {
    const { role } = await requireAuth();
    requireAdmin(role);

    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const tomorrow = new Date(today.getTime() + 24 * 3600 * 1000);
    const todayISO = today.toISOString().slice(0, 10);
    const weekStart = new Date(today.getTime() - 6 * 24 * 3600 * 1000);
    const weekStartISO = weekStart.toISOString().slice(0, 10);

    // Pending counts
    const [leavesHead, regsHead] = await Promise.all([
      supabase.from("leave_requests").select("id", { head: true, count: "exact" }).eq("status", "pending"),
      supabase.from("regularizations").select("id", { head: true, count: "exact" }).eq("status", "pending"),
    ]);
    const pendingLeaves = leavesHead.count || 0;
    const pendingRegularizations = regsHead.count || 0;

    // Today punches ("in" events) and employees present (distinct user_ids with an "in" today)
    const { data: punchRows } = await supabase
      .from("attendance_logs")
      .select("user_id,type,at")
      .eq("type", "in")
      .gte("at", today.toISOString())
      .lt("at", tomorrow.toISOString());
    const punchesToday = (punchRows || []).length;
    const presentSet = new Set<string>();
    (punchRows || []).forEach((r) => presentSet.add(r.user_id));
    const employeesPresentToday = presentSet.size;

    // Half-days today
    const halfTodayHead = await supabase
      .from("attendance_days")
      .select("user_id", { head: true, count: "exact" })
      .eq("day", todayISO)
      .eq("half_day", true);
    const halfDaysToday = halfTodayHead.count || 0;

    // Disconnects today (sum of counts)
    const { data: discTodayRows } = await supabase
      .from("disconnect_events")
      .select("count")
      .eq("day", todayISO);
    const disconnectsToday = (discTodayRows || []).reduce((sum, r: any) => sum + (r.count || 0), 0);

    // Week series for disconnects and half-days
    const [{ data: discWeek }, { data: halfWeek }] = await Promise.all([
      supabase
        .from("disconnect_events")
        .select("day,count")
        .gte("day", weekStartISO)
        .lte("day", todayISO),
      supabase
        .from("attendance_days")
        .select("day,half_day")
        .gte("day", weekStartISO)
        .lte("day", todayISO),
    ]);

    const dayKeys: string[] = [];
    for (let d = 0; d < 7; d++) {
      const t = new Date(weekStart.getTime() + d * 24 * 3600 * 1000);
      dayKeys.push(t.toISOString().slice(0, 10));
    }

    const discMap = new Map<string, number>();
    (discWeek || []).forEach((r: any) => discMap.set(r.day, (discMap.get(r.day) || 0) + (r.count || 0)));
    const halfMap = new Map<string, number>();
    (halfWeek || []).forEach((r: any) => {
      if (r.half_day) halfMap.set(r.day, (halfMap.get(r.day) || 0) + 1);
    });
    const weekDisconnects = dayKeys.map((k) => discMap.get(k) || 0);
    const weekHalfDays = dayKeys.map((k) => halfMap.get(k) || 0);

    // Top disconnects by user in the last 7 days
    const { data: discByUser } = await supabase
      .from("disconnect_events")
      .select("user_id,count,day")
      .gte("day", weekStartISO)
      .lte("day", todayISO);
    const userAgg = new Map<string, number>();
    (discByUser || []).forEach((r: any) => userAgg.set(r.user_id, (userAgg.get(r.user_id) || 0) + (r.count || 0)));
    const topDisconnects = Array.from(userAgg.entries())
      .map(([user_id, count]) => ({ user_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const body: KPIResponse = {
      pendingLeaves,
      pendingRegularizations,
      employeesPresentToday,
      punchesToday,
      halfDaysToday,
      disconnectsToday,
      weekDisconnects,
      weekHalfDays,
      topDisconnects,
    };
    return NextResponse.json(body);
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

