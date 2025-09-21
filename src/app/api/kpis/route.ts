import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const now = new Date();
    const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthStart = monthStartDate.toISOString().slice(0, 10);
    const monthEnd = monthEndDate.toISOString().slice(0, 10);

    // Fetch attendance_days for this month
    const { data: days, error: daysErr } = await supabase
      .from("attendance_days")
      .select("day,half_day")
      .eq("user_id", userId)
      .gte("day", monthStart)
      .lte("day", monthEnd)
      .order("day");

    let attendancePercent = 0;
    let halfPct = 0;
    if (!daysErr && days && days.length > 0) {
      const presentEquivalent = days.reduce((acc, d) => acc + (d.half_day ? 0.5 : 1), 0);
      const totalConsidered = days.length;
      attendancePercent = Math.round((presentEquivalent / totalConsidered) * 100);
      const halfDays = days.filter((d: any) => d.half_day).length;
      halfPct = Math.round((halfDays / totalConsidered) * 100);
    }

    // Pending counts and today's disconnects
    const todayISO = new Date().toISOString().slice(0, 10);
    const [leaves, regs, disc] = await Promise.all([
      supabase.from("leave_requests").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "pending"),
      supabase.from("regularizations").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "pending"),
      supabase.from("disconnect_events").select("count").eq("user_id", userId).eq("day", todayISO).maybeSingle(),
    ]);

    const pending = (leaves.count || 0) + (regs.count || 0);
    const todayDisconnects = (disc.data?.count as number) || 0;

    // Approved leave days used this month (rough estimate)
    const { data: apprLeaves } = await supabase
      .from("leave_requests")
      .select("start_date,end_date,status")
      .eq("user_id", userId)
      .eq("status", "approved")
      .lte("start_date", monthEnd)
      .gte("end_date", monthStart);

    const clampToMonth = (d: Date) => new Date(Math.min(Math.max(d.getTime(), monthStartDate.getTime()), monthEndDate.getTime()));
    const approvedLeaveDays = (apprLeaves || []).reduce((sum: number, r: any) => {
      const s = clampToMonth(new Date(r.start_date));
      const e = clampToMonth(new Date(r.end_date));
      // inclusive days
      const days = Math.max(0, Math.floor((e.getTime() - s.getTime()) / (24 * 3600 * 1000)) + 1);
      return sum + days;
    }, 0);

    return NextResponse.json({ attendancePercent, pending, halfPct, todayDisconnects, approvedLeaveDays });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ attendancePercent: 0, pending: 0, halfPct: 0, todayDisconnects: 0, approvedLeaveDays: 0 });
  }
}
