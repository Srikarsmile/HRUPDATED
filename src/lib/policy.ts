import { supabaseServer as supabase } from "@/lib/supabaseServer";

export async function applyHalfDayIfNeeded(userId: string, dayISO: string) {
  // If >2 disconnects in a day, mark half_day on attendance_days
  const { data: disc, error: discErr } = await supabase
    .from("disconnect_events")
    .select("count")
    .eq("user_id", userId)
    .eq("day", dayISO)
    .maybeSingle();

  if (discErr) return; // silently ignore policy failures
  const halfDay = (disc?.count ?? 0) > 2;
  const { error } = await supabase
    .from("attendance_days")
    .upsert({ user_id: userId, day: dayISO, half_day: halfDay }, { onConflict: "user_id,day" });
  if (error) {
    // ignore policy write failure – don't block punch
    return;
  }
}
