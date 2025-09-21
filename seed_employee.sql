-- Seed EMPLOYEES into PulseHR (edit rows below)
-- Usage: Open in Supabase SQL editor, edit the VALUES in employee_rows, run.
-- The app identifies users by user_id = 'ip:<PUBLIC_IP>'

-- ========================
-- EDIT ME: employees to insert/update
-- Columns: (public_ip, name, email, department, employee_id)
-- Add as many rows as you need
with employee_rows(public_ip, name, email, department, employee_id) as (
  values
    ('192.168.29.100', 'Employee One', 'employee.one@example.com', 'Engineering', 'EMP1001')
),

-- Default leave entitlements (adjust if needed)
entitlement_defaults(annual, sick, casual) as (
  values (21, 12, 12)
),

uids as (
  select 'ip:' || public_ip as user_id, name, email, department, employee_id from employee_rows
)

-- 1) Upsert employee profiles
insert into employees (user_id, name, email, department, employee_id)
select user_id, name, email, department, employee_id from uids
on conflict (user_id) do update set
  name = excluded.name,
  email = excluded.email,
  department = excluded.department,
  employee_id = excluded.employee_id;

-- 2) Upsert leave entitlements for each employee
insert into leave_entitlements (user_id, type, total)
select u.user_id, e.type, e.total
from uids u
cross join (
  select 'annual'::text as type, (select annual from entitlement_defaults) as total
  union all
  select 'sick',   (select sick   from entitlement_defaults)
  union all
  select 'casual', (select casual from entitlement_defaults)
) e
on conflict (user_id, type) do update set total = excluded.total;

-- 3) OPTIONAL: seed recent attendance (last 7 days, mark every 4th as half-day)
insert into attendance_days (user_id, day, half_day)
select u.user_id,
       (current_date - (n || ' days')::interval)::date as day,
       (n % 4 = 0) as half_day
from uids u, generate_series(0, 6) as t(n)
on conflict (user_id, day) do update set half_day = excluded.half_day;

-- 4) Verify
-- select * from employees where user_id in (select user_id from uids);
-- select * from leave_entitlements where user_id in (select user_id from uids) order by user_id, type;

-- Notes:
-- - If you use an allowlist, add the IP(s) to EMPLOYEE_IPS in .env.local:
--     EMPLOYEE_IPS=203.0.113.20
-- - To see what IP the app sees, open /api/whoami in your browser.
