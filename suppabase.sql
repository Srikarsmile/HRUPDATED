-- Supabase schema for PulseHR (IP-based auth)
-- Run this in Supabase SQL editor.

-- ========================
-- Tables
-- ========================

create table if not exists attendance_logs (
  id bigserial primary key,
  user_id text not null,
  at timestamptz not null default now(),
  type text check (type in ('in','out')) not null,
  method text check (method in ('wifi','gps','manual')) not null,
  ip text
);

create table if not exists attendance_days (
  user_id text not null,
  day date not null,
  half_day boolean not null default false,
  primary key (user_id, day)
);

create table if not exists disconnect_events (
  id bigserial primary key,
  user_id text not null,
  day date not null,
  count int not null default 0,
  unique(user_id, day)
);

create table if not exists leave_requests (
  id bigserial primary key,
  user_id text not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists regularizations (
  id bigserial primary key,
  user_id text not null,
  date date not null,
  reason text not null,
  kind text not null default 'attendance' check (kind in ('attendance','disconnect')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- ========================
-- Indexes (performance)
-- ========================

create index if not exists idx_attendance_logs_user_time on attendance_logs(user_id, at desc);
create index if not exists idx_attendance_days_user_day on attendance_days(user_id, day);
create index if not exists idx_disconnect_events_user_day on disconnect_events(user_id, day);
create index if not exists idx_leave_requests_status_created on leave_requests(status, created_at desc);
create index if not exists idx_regularizations_status_created on regularizations(status, created_at desc);

-- ========================
-- Realtime (listen to changes)
-- Note: run once; running again will error if tables already added.
-- ========================

do $$ begin
  alter publication supabase_realtime add table attendance_logs;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table attendance_days;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table disconnect_events;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table leave_requests;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table regularizations;
exception when duplicate_object then null; end $$;

-- ========================
-- Access logs
-- ========================

create table if not exists access_logs (
  id bigserial primary key,
  user_id text not null,
  ip text,
  path text not null,
  at timestamptz not null default now()
);

create index if not exists idx_access_logs_time on access_logs(at desc);
create index if not exists idx_access_logs_user on access_logs(user_id, at desc);

do $$ begin
  alter publication supabase_realtime add table access_logs;
exception when duplicate_object then null; end $$;

-- ========================
-- RLS (row level security) - Hardened
-- Enable RLS and allow only SELECT to anon for realtime; writes are restricted to service role.
-- ========================

alter table if exists attendance_logs enable row level security;
alter table if exists attendance_days enable row level security;
alter table if exists disconnect_events enable row level security;
alter table if exists leave_requests enable row level security;
alter table if exists regularizations enable row level security;
alter table if exists access_logs enable row level security;

-- Read policies (anon can read; needed for client-side realtime visualizations)
drop policy if exists "read_attendance_logs_anon" on attendance_logs;
create policy "read_attendance_logs_anon" on attendance_logs for select to anon using (true);
drop policy if exists "read_attendance_days_anon" on attendance_days;
create policy "read_attendance_days_anon" on attendance_days for select to anon using (true);
drop policy if exists "read_disconnect_events_anon" on disconnect_events;
create policy "read_disconnect_events_anon" on disconnect_events for select to anon using (true);
drop policy if exists "read_leave_requests_anon" on leave_requests;
create policy "read_leave_requests_anon" on leave_requests for select to anon using (true);
drop policy if exists "read_regularizations_anon" on regularizations;
create policy "read_regularizations_anon" on regularizations for select to anon using (true);

-- Write policies (service role only)
drop policy if exists "write_attendance_logs_service" on attendance_logs;
create policy "write_attendance_logs_service" on attendance_logs for insert with check (auth.role() = 'service_role');
drop policy if exists "update_attendance_logs_service" on attendance_logs;
create policy "update_attendance_logs_service" on attendance_logs for update using (auth.role() = 'service_role');
drop policy if exists "delete_attendance_logs_service" on attendance_logs;
create policy "delete_attendance_logs_service" on attendance_logs for delete using (auth.role() = 'service_role');

drop policy if exists "write_attendance_days_service" on attendance_days;
create policy "write_attendance_days_service" on attendance_days for insert with check (auth.role() = 'service_role');
drop policy if exists "update_attendance_days_service" on attendance_days;
create policy "update_attendance_days_service" on attendance_days for update using (auth.role() = 'service_role');
drop policy if exists "delete_attendance_days_service" on attendance_days;
create policy "delete_attendance_days_service" on attendance_days for delete using (auth.role() = 'service_role');

drop policy if exists "write_disconnect_events_service" on disconnect_events;
create policy "write_disconnect_events_service" on disconnect_events for insert with check (auth.role() = 'service_role');
drop policy if exists "update_disconnect_events_service" on disconnect_events;
create policy "update_disconnect_events_service" on disconnect_events for update using (auth.role() = 'service_role');
drop policy if exists "delete_disconnect_events_service" on disconnect_events;
create policy "delete_disconnect_events_service" on disconnect_events for delete using (auth.role() = 'service_role');

drop policy if exists "write_leave_requests_service" on leave_requests;
create policy "write_leave_requests_service" on leave_requests for insert with check (auth.role() = 'service_role');
drop policy if exists "update_leave_requests_service" on leave_requests;
create policy "update_leave_requests_service" on leave_requests for update using (auth.role() = 'service_role');
drop policy if exists "delete_leave_requests_service" on leave_requests;
create policy "delete_leave_requests_service" on leave_requests for delete using (auth.role() = 'service_role');

drop policy if exists "write_regularizations_service" on regularizations;
create policy "write_regularizations_service" on regularizations for insert with check (auth.role() = 'service_role');
drop policy if exists "update_regularizations_service" on regularizations;
create policy "update_regularizations_service" on regularizations for update using (auth.role() = 'service_role');
drop policy if exists "delete_regularizations_service" on regularizations;
create policy "delete_regularizations_service" on regularizations for delete using (auth.role() = 'service_role');

-- Do not allow public read on access logs (sensitive). Access via server API only.
drop policy if exists "read_access_logs_anon" on access_logs;
drop policy if exists "write_access_logs_service" on access_logs;
create policy "write_access_logs_service" on access_logs for insert with check (auth.role() = 'service_role');
drop policy if exists "delete_access_logs_service" on access_logs;
create policy "delete_access_logs_service" on access_logs for delete using (auth.role() = 'service_role');

-- ========================
-- Employee Profiles Table
-- ========================

create table if not exists employees (
  user_id text primary key,
  name text not null,
  email text,
  department text,
  employee_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_employees_employee_id on employees(employee_id);

-- RLS policies for employees table
alter table if exists employees enable row level security;

-- Read policy (anon can read for dashboard display)
drop policy if exists "read_employees_anon" on employees;
create policy "read_employees_anon" on employees for select to anon using (true);

-- Write policies (service role only)
drop policy if exists "write_employees_service" on employees;
create policy "write_employees_service" on employees for insert with check (auth.role() = 'service_role');
drop policy if exists "update_employees_service" on employees;
create policy "update_employees_service" on employees for update using (auth.role() = 'service_role');
drop policy if exists "delete_employees_service" on employees;
create policy "delete_employees_service" on employees for delete using (auth.role() = 'service_role');

-- Add to realtime
do $$ begin
  alter publication supabase_realtime add table employees;
exception when duplicate_object then null; end $$;

-- ========================
-- Sample Employee Data
-- ========================

insert into employees (user_id, name, email, department, employee_id) values
  ('ip:127.0.0.1', 'Alice Johnson', 'alice.johnson@company.com', 'Engineering', 'EMP001'),
  ('ip:::1', 'Alice Johnson', 'alice.johnson@company.com', 'Engineering', 'EMP001'),
  ('ip:192.168.29.100', 'Bob Smith', 'bob.smith@company.com', 'Marketing', 'EMP002'),
  ('ip:192.168.29.101', 'Carol Davis', 'carol.davis@company.com', 'HR', 'EMP003'),
  ('ip:192.168.29.102', 'David Wilson', 'david.wilson@company.com', 'Finance', 'EMP004'),
  ('ip:192.168.29.103', 'Emma Brown', 'emma.brown@company.com', 'Design', 'EMP005')
on conflict (user_id) do update set
  name = excluded.name,
  email = excluded.email,
  department = excluded.department,
  employee_id = excluded.employee_id;

-- ========================
-- Optional attendance sample data (uncomment to use)
-- ========================
-- insert into attendance_days (user_id, day, half_day) values
--   ('ip:127.0.0.1', current_date, false)
-- on conflict (user_id, day) do update set half_day = excluded.half_day;
