import { vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.OFFICE_IPS = '';

// Mock next/headers to provide stable IP for rate limiting and auth
vi.mock('next/headers', () => {
  return {
    headers: async () => new Map<string, string>([
      ['x-forwarded-for', '127.0.0.1']
    ]),
  };
});

// Mock Supabase server client to avoid real DB access in tests
vi.mock('@/lib/supabaseServer', () => {
  const stub = {
    from: () => ({
      select: () => ({
        eq: () => ({ order: () => ({ then: (r: any) => r }) }),
      }),
      insert: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id: 1 }, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id: 1 }, error: null }) }) }) }),
      upsert: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id: 1 }, error: null }) }) }),
      order: () => ({ limit: () => ({ then: (r: any) => r }) }),
      eq: () => ({ order: () => ({ then: (r: any) => r }) }),
      gte: () => ({ lte: () => ({ order: () => ({ then: (r: any) => r }) }) }),
    }),
  } as any;
  return { supabaseServer: stub };
});

// Mock applyHalfDayIfNeeded to no-op
vi.mock('@/lib/policy', () => ({ applyHalfDayIfNeeded: async () => {} }));

