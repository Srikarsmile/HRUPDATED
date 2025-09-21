import { headers } from "next/headers";

type WindowConfig = { limit: number; windowMs: number };

// In-memory token bucket keyed by ip+route. Good enough for single process.
const buckets = new Map<string, { tokens: number; resetAt: number }>();

function keyFor(route: string, ip: string | null): string {
  return `${route}|${ip || 'unknown'}`;
}

export async function rateLimit(route: string, cfg: WindowConfig = { limit: 60, windowMs: 60_000 }) {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  const ip = (xff ? xff.split(",")[0]?.trim() : h.get("x-real-ip")) || null;
  const k = keyFor(route, ip);
  const now = Date.now();
  let b = buckets.get(k);
  if (!b || now > b.resetAt) {
    b = { tokens: cfg.limit, resetAt: now + cfg.windowMs };
  }
  if (b.tokens <= 0) {
    const retry = Math.max(0, b.resetAt - now);
    const err: any = new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: { "Retry-After": String(Math.ceil(retry / 1000)) } });
    throw err;
  }
  b.tokens -= 1;
  buckets.set(k, b);
}

// Convenience presets
export const burst = (route: string) => rateLimit(route, { limit: 10, windowMs: 10_000 });
export const standard = (route: string) => rateLimit(route, { limit: 60, windowMs: 60_000 });
export const strict = (route: string) => rateLimit(route, { limit: 5, windowMs: 10_000 });

