import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    // Fetch attendance_days for this month
    const { data: days, error: daysErr } = await supabase
      .from("attendance_days")
      .select("day,half_day")
      .eq("user_id", userId)
      .gte("day", monthStart)
      .lte("day", monthEnd)
      .order("day");

    let attendancePercent = 0;
    if (!daysErr && days && days.length > 0) {
      const presentEquivalent = days.reduce((acc, d) => acc + (d.half_day ? 0.5 : 1), 0);
      const totalConsidered = days.length;
      attendancePercent = Math.round((presentEquivalent / totalConsidered) * 100);
    }

    // Pending counts
    const [leaves, regs] = await Promise.all([
      supabase.from("leave_requests").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "pending"),
      supabase.from("regularizations").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "pending"),
    ]);

    const pending = (leaves.count || 0) + (regs.count || 0);

    return NextResponse.json({ attendancePercent, pending });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ attendancePercent: 0, pending: 0 });
  }
}
