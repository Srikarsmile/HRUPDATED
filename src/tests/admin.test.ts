import { describe, it, expect, vi } from 'vitest';
import { POST as adminReqPost } from '@/app/api/admin/requests/route';

// Mock requireAuth to return hr role
vi.mock('@/lib/auth', async (orig) => {
  const mod = await (orig as any)();
  return { ...mod, requireAuth: async () => ({ userId: 'ip:127.0.0.1', role: 'hr' }), requireAdmin: () => {} };
});

describe('admin/requests POST', () => {
  it('rejects invalid action', async () => {
    const req = new Request('http://localhost/api/admin/requests', { method: 'POST', body: JSON.stringify({ kind: 'leave', id: 1, action: 'bad' }) });
    const res = await adminReqPost(req as any);
    expect(res.status).toBe(400);
  });
});

