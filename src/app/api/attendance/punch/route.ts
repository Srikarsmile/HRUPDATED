import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import { requireAuth } from "@/lib/auth";
import { getClientIp, isIpAllowed, parseOfficeIps } from "@/lib/net";
import { parseOfficeGeofences, isGpsAllowed } from "@/lib/geo";
import { applyHalfDayIfNeeded } from "@/lib/policy";
import { parseJson, z } from "@/lib/validate";
import { strict as rateStrict } from "@/lib/rate";
import { verifyLocationToken } from "@/lib/locationToken";
import { captureError } from "@/lib/monitoring";

export async function POST(req: Request) {
  try {
    await rateStrict("attendance:punch:post");
    const { userId, role } = await requireAuth();
    const body = await req.json();
    const payload = parseJson(body, z.object({
      type: z.enum(["in", "out"]),
      method: z.enum(["wifi", "gps", "manual"]).default("wifi").optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      reason: z.string().optional(),
      token: z.string().optional(),
    }));
    const type = payload.type;
    const method = (payload.method || "wifi") as "wifi" | "gps" | "manual";
    const lat = payload.lat;
    const lng = payload.lng;
    const reason = payload.reason;

    // type validated by zod above

    const ip = await getClientIp();

    if (method === "wifi") {
      // Require office Wi‑Fi IP allowlist
      const allowed = isIpAllowed(ip, parseOfficeIps());
      if (!allowed) {
        return NextResponse.json({ error: "Not on office network", ip }, { status: 403 });
      }
    } else if (method === "gps") {
      // Require coordinates and within configured geofence(s)
      const fences = parseOfficeGeofences();
      if (!Number.isFinite(lat as number) || !Number.isFinite(lng as number)) {
        return NextResponse.json({ error: "lat and lng required for GPS punch" }, { status: 400 });
      }
      if (fences.length === 0) {
        return NextResponse.json({ error: "GPS geofence not configured (set OFFICE_GEO or OFFICE_LAT/OFFICE_LNG)" }, { status: 503 });
      }
      const ok = isGpsAllowed(lat, lng, fences);
      if (!ok) {
        return NextResponse.json({ error: "Out of geofence for GPS punch" }, { status: 403 });
      }
      const requireToken = String(process.env.REQUIRE_GEO_TOKEN || "false").toLowerCase() === "true";
      if (requireToken) {
        const token = payload.token;
        if (!token) return NextResponse.json({ error: "Location token required" }, { status: 401 });
        const verified = verifyLocationToken(token);
        if (!verified) return NextResponse.json({ error: "Invalid or expired location token" }, { status: 401 });
      }
    } else if (method === "manual") {
      // Restrict manual punches to HR/Admin only and require a reason
      if (!(role === "hr" || role === "admin")) {
        return NextResponse.json({ error: "Manual punch allowed for HR/Admin only" }, { status: 403 });
      }
      if (!reason || String(reason).trim().length < 3) {
        return NextResponse.json({ error: "Manual punch requires a non-empty reason" }, { status: 400 });
      }
    }

    const now = new Date();
    const dayISO = now.toISOString().slice(0, 10); // YYYY-MM-DD

    const { data, error } = await supabase
      .from("attendance_logs")
      .insert({ user_id: userId, at: now.toISOString(), type, method, ip })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await applyHalfDayIfNeeded(userId, dayISO);
    return NextResponse.json({ ok: true, log: data });
  } catch (e: any) {
    captureError(e, { route: 'attendance/punch' });
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
