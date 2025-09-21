export type Geofence = { lat: number; lng: number; radiusM: number };

// Parse geofences from env.
// Preferred: OFFICE_GEO="lat,lng,radiusM;lat2,lng2,radius2"
// Fallback: OFFICE_LAT, OFFICE_LNG, OFFICE_RADIUS_M
export function parseOfficeGeofences(): Geofence[] {
  const multi = (process.env.OFFICE_GEO || "").trim();
  const fences: Geofence[] = [];
  if (multi) {
    for (const part of multi.split(";")) {
      const [latStr, lngStr, rStr] = part.split(",").map((s) => s.trim());
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      const radiusM = parseFloat(rStr || "150");
      if (Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(radiusM)) {
        fences.push({ lat, lng, radiusM });
      }
    }
  }
  if (fences.length === 0) {
    const lat = parseFloat(String(process.env.OFFICE_LAT || ""));
    const lng = parseFloat(String(process.env.OFFICE_LNG || ""));
    const radiusM = parseFloat(String(process.env.OFFICE_RADIUS_M || "150"));
    if (Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(radiusM)) {
      fences.push({ lat, lng, radiusM });
    }
  }
  return fences;
}

export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isGpsAllowed(lat: number | null | undefined, lng: number | null | undefined, fences: Geofence[]): boolean {
  if (!Number.isFinite(lat as number) || !Number.isFinite(lng as number)) return false;
  const la = Number(lat);
  const ln = Number(lng);
  for (const f of fences) {
    const d = haversineM(la, ln, f.lat, f.lng);
    if (d <= f.radiusM) return true;
  }
  return false;
}

