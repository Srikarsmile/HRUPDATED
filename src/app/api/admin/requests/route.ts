import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth, requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const { role } = await requireAuth();
    requireAdmin(role);
    const [leaves, regs] = await Promise.all([
      supabase.from("leave_requests").select("id,user_id,start_date,end_date,reason,status,created_at").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("regularizations").select("id,user_id,date,reason,kind,status,created_at").eq("status", "pending").order("created_at", { ascending: false }),
    ]);
    if (leaves.error) return NextResponse.json({ error: leaves.error.message }, { status: 500 });
    if (regs.error) return NextResponse.json({ error: regs.error.message }, { status: 500 });
    return NextResponse.json({ leaves: leaves.data, regularizations: regs.data });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { role } = await requireAuth();
    requireAdmin(role);
    const { kind, id, action } = await req.json();
    if (!kind || !id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "kind, id and action required" }, { status: 400 });
    }
    const table = kind === "leave" ? "leave_requests" : "regularizations";
    const status = action === "approve" ? "approved" : "rejected";
    const { data, error } = await supabase
      .from(table)
      .update({ status })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, item: data });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
