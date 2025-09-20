import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const { data, error } = await supabase
      .from("regularizations")
      .select("id,date,reason,kind,status,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const { date, reason, kind } = body || {}; // kind: 'attendance' | 'disconnect'
    if (!date || !reason) {
      return NextResponse.json({ error: "date and reason required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("regularizations")
      .insert({ user_id: userId, date, reason, kind: kind || "attendance", status: "pending" })
      .select()
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, item: data });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
