import { NextResponse } from "next/server";
import { parseOfficeGeofences, haversineM, isGpsAllowed } from "@/lib/geo";
import { createLocationToken } from "@/lib/locationToken";
import { parseQuery, z } from "@/lib/validate";
import { burst } from "@/lib/rate";

export async function GET(req: Request) {
  try {
    await burst("geo-check:get");
    const fences = parseOfficeGeofences();
    const url = new URL(req.url);
    const qp = parseQuery(url.searchParams, z.object({ lat: z.string().optional(), lng: z.string().optional() }));
    const latStr = qp.lat;
    const lngStr = qp.lng;

    const configured = fences.length > 0;
    if (!latStr || !lngStr) {
      return NextResponse.json({ configured, allowed: null, fencesCount: fences.length, center: fences[0] || null });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    if (!configured) {
      return NextResponse.json({ configured: false, allowed: false, reason: "No geofence configured" });
    }

    let nearest = Number.POSITIVE_INFINITY;
    let matchRadius = null as number | null;
    let matchCenter: any = null;
    for (const f of fences) {
      const d = haversineM(lat, lng, f.lat, f.lng);
      if (d < nearest) nearest = d;
      if (d <= f.radiusM) {
        matchRadius = f.radiusM;
        matchCenter = f;
        break;
      }
    }

    const allowed = isGpsAllowed(lat, lng, fences);
    const resp: any = { configured: true, allowed, nearestDistanceM: nearest, radiusM: matchRadius, center: matchCenter };
    const requireToken = String(process.env.REQUIRE_GEO_TOKEN || "false").toLowerCase() === "true";
    if (allowed && requireToken) {
      // generate short-lived token binding approximate coords
      // userId/ip left undefined here; verified on punch
      const token = createLocationToken({ lat, lng, ttlSec: 120 });
      if (token) resp.token = token;
    }
    return NextResponse.json(resp);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
