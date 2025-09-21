-- Seed sample users and optional demo data for PulseHR
-- Usage: Run this AFTER executing hr-platform/suppabase.sql in your Supabase SQL editor.
-- Then update your .env.local to match the IPs used below for HR/Employees.

--
-- Recommended .env.local entries (set to match your network):
--   HR_IPS=203.0.113.10
--   OFFICE_IPS=203.0.113.0/24
--   REQUIRE_OFFICE_FOR_ACCESS=false  -- set true to restrict all access to office IPs
--
-- Notes:
-- - The application identifies users by user_id = 'ip:<client_ip>'.
-- - HR/Admin is determined by HR_IP/HR_IPS env vars (not stored in DB).
-- - You can change the sample IPs below to your actual public/NAT IPs.

-- ========================
-- Employees (user profiles)
-- ========================

insert into employees (user_id, name, email, department, employee_id)
values
  -- Local development (localhost)
  ('ip:127.0.0.1',       'Alice Johnson', 'alice.johnson@example.com', 'Engineering', 'EMP001'),
  -- Example HR user (set this IP in HR_IPS)
  ('ip:203.0.113.10',    'Jane HR',       'jane.hr@example.com',       'HR',         'EMP010'),
  -- Example employees (set these IPs in EMPLOYEE_IPS if you use allowlist)
  ('ip:203.0.113.20',    'John Doe',      'john.doe@example.com',      'Engineering','EMP011'),
  ('ip:203.0.113.21',    'Mary Smith',    'mary.smith@example.com',    'Marketing',  'EMP012'),
  ('ip:198.51.100.15',   'Carlos Vega',   'carlos.vega@example.com',   'Finance',    'EMP013'),
  ('ip:192.168.29.100',  'Priya Iyer',    'priya.iyer@example.com',    'Design',     'EMP014')
on conflict (user_id) do update set
  name = excluded.name,
  email = excluded.email,
  department = excluded.department,
  employee_id = excluded.employee_id;

-- ========================
-- Leave entitlements (per user/type)
-- ========================

insert into leave_entitlements (user_id, type, total) values
  ('ip:127.0.0.1',      'annual', 21),
  ('ip:127.0.0.1',      'sick',   12),
  ('ip:127.0.0.1',      'casual', 12),
  ('ip:203.0.113.10',   'annual', 21),
  ('ip:203.0.113.10',   'sick',   12),
  ('ip:203.0.113.10',   'casual', 12),
  ('ip:203.0.113.20',   'annual', 21),
  ('ip:203.0.113.20',   'sick',   12),
  ('ip:203.0.113.20',   'casual', 12),
  ('ip:203.0.113.21',   'annual', 21),
  ('ip:203.0.113.21',   'sick',   12),
  ('ip:203.0.113.21',   'casual', 12)
on conflict (user_id, type) do update set total = excluded.total;

-- ========================
-- OPTIONAL: Sample attendance aggregates (for dashboard KPIs)
-- Creates the last 14 days of attendance for a sample employee
-- ========================

insert into attendance_days (user_id, day, half_day)
select 'ip:203.0.113.20' as user_id,
       (current_date - (n || ' days')::interval)::date as day,
       -- Every 5th day is a half-day for demo
       (n % 5 = 0) as half_day
from generate_series(0, 14) as t(n)
on conflict (user_id, day) do update set half_day = excluded.half_day;

-- ========================
-- OPTIONAL: Sample disconnect events to trigger half-days
-- (>2 disconnects on a day should imply half-day per policy)
-- ========================

insert into disconnect_events (user_id, day, count)
values
  ('ip:203.0.113.20', current_date, 3),
  ('ip:203.0.113.20', current_date - interval '5 days', 4)
on conflict (user_id, day) do update set count = excluded.count;

-- ========================
-- OPTIONAL: Sample attendance punch logs (for recent activity list)
-- ========================

insert into attendance_logs (user_id, at, type, method, ip) values
  ('ip:203.0.113.20', now() - interval '8 hours', 'in',  'wifi', '203.0.113.20'),
  ('ip:203.0.113.20', now() - interval '1 hours', 'out', 'wifi', '203.0.113.20'),
  ('ip:203.0.113.21', now() - interval '9 hours', 'in',  'wifi', '203.0.113.21')
on conflict do nothing;

-- ========================
-- OPTIONAL: Sample leave and regularization requests
-- ========================

insert into leave_requests (user_id, start_date, end_date, reason, status) values
  ('ip:203.0.113.21', current_date + 2, current_date + 4, 'Family trip', 'pending'),
  ('ip:203.0.113.20', current_date - 10, current_date - 8, 'Medical',     'approved')
on conflict do nothing;

insert into regularizations (user_id, date, reason, kind, status) values
  ('ip:203.0.113.20', current_date - 1, 'Missed punch', 'attendance', 'pending'),
  ('ip:203.0.113.21', current_date - 3, 'Disconnect',   'disconnect', 'approved')
on conflict do nothing;

-- Done. Update your .env.local to:
--   HR_IPS=203.0.113.10
--   EMPLOYEE_IPS=203.0.113.20,203.0.113.21,198.51.100.15,192.168.29.100  -- optional allowlist
--   OFFICE_IPS=203.0.113.0/24
-- Then test with curl headers (in dev) or from those IPs in prod:
--   curl -H 'x-forwarded-for: 203.0.113.20' http://localhost:3000/api/whoami
--   curl -H 'x-forwarded-for: 203.0.113.10' http://localhost:3000/api/whoami
