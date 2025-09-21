import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";
import { applyHalfDayIfNeeded } from "@/lib/policy";
import { strict as rateStrict } from "@/lib/rate";
import { captureError } from "@/lib/monitoring";

export async function POST() {
  try {
    await rateStrict("attendance:disconnect:post");
    const { userId } = await requireAuth();
    const now = new Date();
    const dayISO = now.toISOString().slice(0, 10);

    // Get existing count
    const { data: existing, error: selErr } = await supabase
      .from("disconnect_events")
      .select("id,count")
      .eq("user_id", userId)
      .eq("day", dayISO)
      .maybeSingle();

    if (selErr) {
      return NextResponse.json({ error: selErr.message }, { status: 500 });
    }

    if (existing) {
      const { error: updErr, data } = await supabase
        .from("disconnect_events")
        .update({ count: (existing.count || 0) + 1 })
        .eq("id", existing.id)
        .select()
        .maybeSingle();

      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
      await applyHalfDayIfNeeded(userId, dayISO);
      return NextResponse.json({ ok: true, record: data });
    } else {
      const { data, error } = await supabase
        .from("disconnect_events")
        .insert({ user_id: userId, day: dayISO, count: 1 })
        .select()
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await applyHalfDayIfNeeded(userId, dayISO);
      return NextResponse.json({ ok: true, record: data });
    }
  } catch (e: any) {
    captureError(e, { route: 'attendance/disconnect:post' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
