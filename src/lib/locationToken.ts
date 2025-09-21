import crypto from 'crypto';

type Payload = { lat: number; lng: number; userId?: string; ip?: string; iat: number; exp: number };

function getSecret(): string | null {
  return process.env.GEO_TOKEN_SECRET || null;
}

export function createLocationToken(p: Omit<Payload, 'iat' | 'exp'> & { ttlSec?: number }) {
  const secret = getSecret();
  if (!secret) return null;
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + Math.max(30, Math.min(600, p.ttlSec || 120));
  const payload: Payload = { lat: p.lat, lng: p.lng, userId: p.userId, ip: p.ip, iat, exp };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyLocationToken(token: string): Payload | null {
  const secret = getSecret();
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expSig))) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as Payload;
    const now = Math.floor(Date.now() / 1000);
    if (now > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

