-- Upgrade SQL to enable real leave balances
-- Run this after the initial hr-platform/suppabase.sql has been applied.

-- 1) Add leave type to leave_requests
alter table if exists leave_requests
  add column if not exists type text not null default 'annual'
  check (type in ('annual','sick','casual'));

-- 2) Leave entitlements per user and type
create table if not exists leave_entitlements (
  user_id text not null,
  type text not null check (type in ('annual','sick','casual')),
  total integer not null default 0,
  primary key (user_id, type)
);

alter table if exists leave_entitlements enable row level security;

-- Read policy (anon can read for dashboard display)
drop policy if exists "read_leave_entitlements_anon" on leave_entitlements;
create policy "read_leave_entitlements_anon" on leave_entitlements for select to anon using (true);

-- Write policies (service role only)
drop policy if exists "write_leave_entitlements_service" on leave_entitlements;
create policy "write_leave_entitlements_service" on leave_entitlements for insert with check (auth.role() = 'service_role');
drop policy if exists "update_leave_entitlements_service" on leave_entitlements;
create policy "update_leave_entitlements_service" on leave_entitlements for update using (auth.role() = 'service_role');
drop policy if exists "delete_leave_entitlements_service" on leave_entitlements;
create policy "delete_leave_entitlements_service" on leave_entitlements for delete using (auth.role() = 'service_role');

-- Add to realtime
do $$ begin
  alter publication supabase_realtime add table leave_entitlements;
exception when duplicate_object then null; end $$;

