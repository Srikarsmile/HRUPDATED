import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { standard as rateStandard } from "@/lib/rate";
import { captureError } from "@/lib/monitoring";

export async function GET() {
  try {
    await rateStandard("employee:profile:get");
    const { userId } = await requireAuth();

    const { data: employee, error } = await supabaseServer
      .from("employees")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If employee not found, return basic info with userId
      if (error.code === "PGRST116") {
        return NextResponse.json({
          user_id: userId,
          name: null,
          email: null,
          department: null,
          employee_id: null,
          found: false
        });
      }
      throw error;
    }

    return NextResponse.json({ ...employee, found: true });
  } catch (e: any) {
    captureError(e, { route: 'employee/profile:get' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
