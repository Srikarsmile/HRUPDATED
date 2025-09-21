import { z } from "zod";

export function parseJson<T extends z.ZodTypeAny>(body: any, schema: T): z.infer<T> {
  const res = schema.safeParse(body);
  if (!res.success) {
    const msg = res.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    throw new Response(JSON.stringify({ error: `Invalid payload: ${msg}` }), { status: 400 });
  }
  return res.data as any;
}

export function parseQuery<T extends z.ZodTypeAny>(searchParams: URLSearchParams, schema: T): z.infer<T> {
  const obj: any = {};
  for (const [k, v] of searchParams.entries()) obj[k] = v;
  const res = schema.safeParse(obj);
  if (!res.success) {
    const msg = res.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    throw new Response(JSON.stringify({ error: `Invalid query: ${msg}` }), { status: 400 });
  }
  return res.data as any;
}

export { z };

