-- Production RLS hardening for PulseHR
-- Apply to Supabase to restrict anon reads and enforce server-only access.

-- Enable RLS on all tables
alter table if exists attendance_logs enable row level security;
alter table if exists attendance_days enable row level security;
alter table if exists disconnect_events enable row level security;
alter table if exists leave_requests enable row level security;
alter table if exists regularizations enable row level security;
alter table if exists access_logs enable row level security;
alter table if exists employees enable row level security;

-- Remove anon read policies and create service-role policies, only if the table exists

do $$ begin
  if to_regclass('public.attendance_logs') is not null then
    begin
      drop policy if exists "read_attendance_logs_anon" on public.attendance_logs;
    exception when others then null; end;
    begin
      create policy all_attendance_logs_service on public.attendance_logs for all
        using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
    exception when duplicate_object then null; end;
  end if;
end $$;

do $$ begin
  if to_regclass('public.attendance_days') is not null then
    begin
      drop policy if exists "read_attendance_days_anon" on public.attendance_days;
    exception when others then null; end;
    begin
      create policy all_attendance_days_service on public.attendance_days for all
        using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
    exception when duplicate_object then null; end;
  end if;
end $$;

do $$ begin
  if to_regclass('public.disconnect_events') is not null then
    begin
      drop policy if exists "read_disconnect_events_anon" on public.disconnect_events;
    exception when others then null; end;
    begin
      create policy all_disconnect_events_service on public.disconnect_events for all
        using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
    exception when duplicate_object then null; end;
  end if;
end $$;

do $$ begin
  if to_regclass('public.leave_requests') is not null then
    begin
      drop policy if exists "read_leave_requests_anon" on public.leave_requests;
    exception when others then null; end;
    begin
      create policy all_leave_requests_service on public.leave_requests for all
        using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
    exception when duplicate_object then null; end;
  end if;
end $$;

do $$ begin
  if to_regclass('public.regularizations') is not null then
    begin
      drop policy if exists "read_regularizations_anon" on public.regularizations;
    exception when others then null; end;
    begin
      create policy all_regularizations_service on public.regularizations for all
        using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
    exception when duplicate_object then null; end;
  end if;
end $$;

do $$ begin
  if to_regclass('public.access_logs') is not null then
    -- no public read of access_logs in prod
    begin
      drop policy if exists "read_access_logs_anon" on public.access_logs;
    exception when others then null; end;
    begin
      create policy all_access_logs_service on public.access_logs for all
        using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
    exception when duplicate_object then null; end;
  end if;
end $$;

do $$ begin
  if to_regclass('public.employees') is not null then
    begin
      drop policy if exists "read_employees_anon" on public.employees;
    exception when others then null; end;
    begin
      create policy all_employees_service on public.employees for all
        using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
    exception when duplicate_object then null; end;
  end if;
end $$;

-- Optional: If you adopt Supabase Auth, uncomment below to allow
-- authenticated users to read only their own rows. Ensure your user_id
-- columns store auth.uid() (UUID) instead of IP-derived ids.
--
-- create policy "select_own_attendance" on attendance_logs for select to authenticated using (user_id = auth.uid()::text);
-- create policy "select_own_days" on attendance_days for select to authenticated using (user_id = auth.uid()::text);
-- create policy "select_own_disconnects" on disconnect_events for select to authenticated using (user_id = auth.uid()::text);
-- create policy "select_own_leaves" on leave_requests for select to authenticated using (user_id = auth.uid()::text);
-- create policy "select_own_regs" on regularizations for select to authenticated using (user_id = auth.uid()::text);
-- create policy "select_own_profile" on employees for select to authenticated using (user_id = auth.uid()::text);
