import { describe, it, expect } from 'vitest';
import { POST as punchPost } from '@/app/api/attendance/punch/route';

describe('attendance/punch', () => {
  it('rejects missing type', async () => {
    const req = new Request('http://localhost/api/attendance/punch', { method: 'POST', body: JSON.stringify({ method: 'wifi' }) });
    const res = await punchPost(req as any);
    expect(res.status).toBe(400);
  });
});

