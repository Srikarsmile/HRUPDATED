import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";
import { parseJson, z } from "@/lib/validate";
import { standard as rateStandard, strict as rateStrict } from "@/lib/rate";
import { captureError } from "@/lib/monitoring";

export async function GET() {
  try {
    await rateStandard("regularizations:get");
    const { userId } = await requireAuth();
    const { data, error } = await supabase
      .from("regularizations")
      .select("id,date,reason,kind,status,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data });
  } catch (e: any) {
    captureError(e, { route: 'regularizations/get' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await rateStrict("regularizations:post");
    const { userId } = await requireAuth();
    const body = await req.json();
    const payload = parseJson(body, z.object({
      date: z.string().min(1),
      reason: z.string().min(2),
      kind: z.enum(["attendance","disconnect"]).optional(),
      note: z.string().optional(),
    }));
    const { date, reason, kind } = payload;
    const { data, error } = await supabase
      .from("regularizations")
      .insert({ user_id: userId, date, reason, kind: kind || "attendance", status: "pending" })
      .select()
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, item: data });
  } catch (e: any) {
    captureError(e, { route: 'regularizations/post' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
