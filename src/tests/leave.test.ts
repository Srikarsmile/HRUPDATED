import { describe, it, expect } from 'vitest';
import { POST as leavePost } from '@/app/api/leave/route';

describe('leave POST', () => {
  it('requires start_date and end_date', async () => {
    const req = new Request('http://localhost/api/leave', { method: 'POST', body: JSON.stringify({ reason: 'vacation' }) });
    const res = await leavePost(req as any);
    expect(res.status).toBe(400);
  });
});

