import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";
import { parseJson, z } from "@/lib/validate";
import { standard as rateStandard, strict as rateStrict } from "@/lib/rate";
import { captureError } from "@/lib/monitoring";

export async function GET() {
  try {
    await rateStandard("leave:get");
    const { userId } = await requireAuth();
    const { data, error } = await supabase
      .from("leave_requests")
      .select("id,start_date,end_date,reason,status,created_at,type")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data });
  } catch (e: any) {
    captureError(e, { route: 'leave/get' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await rateStrict("leave:post");
    const { userId } = await requireAuth();
    const body = await req.json();
    const payload = parseJson(body, z.object({
      start_date: z.string().min(1),
      end_date: z.string().min(1),
      reason: z.string().optional(),
      type: z.enum(['annual','sick','casual']).optional(),
    }));
    const { start_date, end_date, reason } = payload;
    const type = String((payload?.type || 'annual')).toLowerCase();
    const allowedTypes = new Set(['annual','sick','casual']);
    const { data, error } = await supabase
      .from("leave_requests")
      .insert({ user_id: userId, start_date, end_date, reason, status: "pending", type: allowedTypes.has(type) ? type : 'annual' })
      .select()
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, item: data });
  } catch (e: any) {
    captureError(e, { route: 'leave/post' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
