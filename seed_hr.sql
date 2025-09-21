-- Seed a single HR/Admin user into PulseHR
-- Usage: Open this in Supabase SQL editor, replace placeholders, and run.
-- IMPORTANT: HR/Admin role is determined by IP via .env (HR_IPS / HR_IP)
-- Replace <HR_PUBLIC_IP>, <NAME>, <EMAIL>

-- 1) Create/Update HR profile in employees table (for greeting and context)
insert into employees (user_id, name, email, department, employee_id)
values
  ('ip:<HR_PUBLIC_IP>', '<NAME>', '<EMAIL>', 'HR', 'HR001')
on conflict (user_id) do update set
  name = excluded.name,
  email = excluded.email,
  department = excluded.department,
  employee_id = excluded.employee_id;

-- 2) Give HR standard leave entitlements (optional)
insert into leave_entitlements (user_id, type, total) values
  ('ip:<HR_PUBLIC_IP>', 'annual', 21),
  ('ip:<HR_PUBLIC_IP>', 'sick',   12),
  ('ip:<HR_PUBLIC_IP>', 'casual', 12)
on conflict (user_id, type) do update set total = excluded.total;

-- 3) Verify
-- select * from employees where user_id = 'ip:<HR_PUBLIC_IP>';

-- 4) Make this user HR by IP (edit your .env.local and restart dev server)
--   HR_IPS=<HR_PUBLIC_IP>
-- Optional (strict office network):
--   OFFICE_IPS=<YOUR_OFFICE_PUBLIC_IP_OR_CIDR>
--   REQUIRE_OFFICE_FOR_ACCESS=true
-- Optional (GPS geofence):
--   OFFICE_GEO=<LAT>,<LNG>,<RADIUS_M>

