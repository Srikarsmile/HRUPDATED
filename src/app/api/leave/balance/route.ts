import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";

type Kind = "annual" | "sick" | "casual";

function yearBounds(d: Date) {
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), 11, 31));
  return { start, end };
}

function clampDate(dt: Date, start: Date, end: Date) {
  return new Date(Math.min(Math.max(dt.getTime(), start.getTime()), end.getTime()));
}

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const now = new Date();
    const { start, end } = yearBounds(now);
    const startISO = start.toISOString().slice(0, 10);
    const endISO = end.toISOString().slice(0, 10);

    // Entitlements (fallback defaults if none found)
    const ent = await supabase
      .from("leave_entitlements")
      .select("type,total")
      .eq("user_id", userId);
    if (ent.error) return NextResponse.json({ error: ent.error.message }, { status: 500 });

    const defaultEnt: Record<Kind, number> = { annual: 21, sick: 12, casual: 12 };
    const entMap = new Map<Kind, number>([
      ["annual", defaultEnt.annual],
      ["sick", defaultEnt.sick],
      ["casual", defaultEnt.casual],
    ]);
    (ent.data || []).forEach((row: any) => {
      const k = String(row.type || "").toLowerCase() as Kind;
      if (k === "annual" || k === "sick" || k === "casual") {
        const tot = Number(row.total || 0);
        if (Number.isFinite(tot) && tot >= 0) entMap.set(k, tot);
      }
    });

    // Approved leaves for the current year
    const ap = await supabase
      .from("leave_requests")
      .select("type,start_date,end_date,status")
      .eq("user_id", userId)
      .eq("status", "approved")
      .lte("start_date", endISO)
      .gte("end_date", startISO);
    if (ap.error) return NextResponse.json({ error: ap.error.message }, { status: 500 });

    const usedMap = new Map<Kind, number>([["annual", 0],["sick", 0],["casual", 0]]);
    (ap.data || []).forEach((r: any) => {
      const k = String(r.type || "annual").toLowerCase() as Kind;
      const s = clampDate(new Date(r.start_date), start, end);
      const e = clampDate(new Date(r.end_date), start, end);
      const days = Math.max(0, Math.floor((e.getTime() - s.getTime()) / (24 * 3600 * 1000)) + 1);
      if (k === "annual" || k === "sick" || k === "casual") {
        usedMap.set(k, (usedMap.get(k) || 0) + days);
      } else {
        usedMap.set("annual", (usedMap.get("annual") || 0) + days);
      }
    });

    const items = (Array.from(entMap.entries()) as [Kind, number][]) .map(([k, total]) => {
      const used = usedMap.get(k) || 0;
      return { type: k, total, used, balance: Math.max(0, total - used) };
    });

    return NextResponse.json({ items, year: now.getUTCFullYear() });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

