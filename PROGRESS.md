# Project Progress

Last updated: 2025-09-20

## Overview

This document summarizes recent changes to move the app to IP‑based auth, integrate Supabase realtime, harden database access with RLS, add access logging, and split HR vs Employee experiences.

## Delivered Features

- IP‑based authentication and roles (no Clerk)
  - Role is resolved from request IP (`HR_IP`/`HR_IPS` → HR; otherwise employee).
  - Optional `EMPLOYEE_IPS` allowlist; if set, only IPs in `HR_IP(S) ∪ EMPLOYEE_IPS` are allowed.
  - Source: `src/lib/auth.ts`.

- HR vs Employee routing
  - Visiting `/dashboard` redirects HR to `/admin`; employees stay on `/dashboard`.
  - Source: `src/middleware.ts`.

- Supabase integration
  - Server‑only client using `SUPABASE_SERVICE_ROLE_KEY`: `src/lib/supabaseServer.ts`.
  - Client anon key used only for realtime subscriptions.
  - Realtime subscriptions in dashboard for quick updates: `src/app/dashboard/page.tsx`.

- Database hardening (RLS + policies) and schema
  - Tables expected: `attendance_logs`, `attendance_days`, `disconnect_events`, `leave_requests`, `regularizations`, `access_logs`.
  - RLS enabled for all; anon has SELECT on non‑sensitive tables only. Writes restricted to service role.
  - Idempotent publication to `supabase_realtime`.
- Source SQL: `hr-platform/suppabase.sql` (run in Supabase SQL editor).

- Access logging
  - Logs page hits to `/dashboard` and `/admin` with IP, user_id, path, timestamp.
  - Table: `access_logs` (+ indexes, RLS).
  - API: `POST /api/log/access` to record; `GET /api/log/access?limit=...` for HR/Admin view.
  - HR log viewer: `/admin/logs`.

- UI/UX updates
  - Dashboard chip shows detected role/IP.
  - Admin page header includes link to logs viewer.
  - Removed Clerk UI, sign‑in/up now redirect to `/dashboard`.

## Files Added

- `src/lib/supabaseServer.ts`
- `src/app/api/whoami/route.ts`
- `src/app/api/log/access/route.ts`
- `src/app/admin/logs/page.tsx`
- `.env.example`
- `suppabase.sql` (idempotent policies + publication)
- `PROGRESS.md` (this file)

## Files Modified (high‑level)

- `src/lib/auth.ts` – IP‑based roles + optional employee allowlist
- `src/middleware.ts` – HR redirect to `/admin`
- `src/app/layout.tsx` – remove Clerk provider
- `src/app/dashboard/page.tsx` – realtime, whoami chip, access logging
- `src/app/admin/page.tsx` – access log link + logging
- API routes switched to server client: KPIs, admin requests, leave, regularizations, attendance punch/disconnect, policy helper
- `src/components/LandingPage.tsx` – CTA to `/dashboard`
- `src/components/dashboard/WelcomeBanner.tsx` – removed Clerk dependency
- `README.md` – schema notes

## Environment Configuration

Create `.env.local` from `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL=…`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=…`
- `SUPABASE_SERVICE_ROLE_KEY=…` (server‑only)
- `HR_IP=` or `HR_IPS=` (comma‑separated)
- `EMPLOYEE_IPS=` (optional allowlist)
- `OFFICE_IPS=` (exact or CIDR; used for punch Wi‑Fi validation)

## Database Setup

Run `hr-platform/suppabase.sql` in Supabase SQL editor. It is idempotent for policies and publication. Ensure Realtime is enabled for listed tables.

## Verification Checklist

- Visit `/dashboard` from an HR IP → redirect to `/admin`.
- `/dashboard` shows role/IP chip (e.g., `HR • <ip>` or `EMPLOYEE • <ip>`).
- Admin requests API returns data only for HR.
- Access logs captured for `/dashboard` and `/admin` and visible at `/admin/logs` (HR only).
- Realtime updates reflect DB changes in dashboard KPIs.
- `/admin/attendance` loads records (HR only) and toggling half‑day updates the table.

## Known Gaps / Next Steps

- Optional: Remove public SELECT and replace client realtime with API polling to further harden.
- Add filters/export to `/admin/logs` (by path/date/IP).
- Monitoring/alerts for abnormal disconnects.
- Unit tests for auth and API routes.
## New Enhancements

- KPI API now includes half‑day percentage, today’s disconnect count, and approved leave days estimate.
- Dashboard Status reflects real Wi‑Fi allow status and shows today’s disconnects.
- Admin Attendance management:
  - API: `GET/POST /api/admin/attendance` to list/toggle half‑days.
  - Page: `/admin/attendance` to filter by user/date and toggle half‑day flags.
