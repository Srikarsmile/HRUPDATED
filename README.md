# HR Platform

A modern HR management system built with Next.js, featuring attendance tracking, leave management, and admin controls.

## Features

- 📍 **WiFi-based Attendance** - Punch in/out with office network verification
- 📊 **Dashboard Analytics** - KPI stats and attendance summaries
- 🏖️ **Leave Management** - Submit and track leave requests
- ⚙️ **Admin Panel** - Approve/reject requests and manage users
- 🔐 **Role-based Access** - Employee vs HR/Admin (IP-based)

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=service_role_key
   NEXT_PUBLIC_ENABLE_CLIENT_SUPABASE=false   # true only if allowing client realtime
   OFFICE_IPS=your_office_ip_addresses  # Comma-separated IPs or CIDR ranges
   REQUIRE_OFFICE_FOR_ACCESS=false       # If true, only office IPs can access the app
   HR_IPS=hr_ip1,hr_ip2                  # IPs treated as HR/Admin
   EMPLOYEE_IPS=optional_allowed_ips     # Optional allowlist (restricts access)
   # Monitoring
   SENTRY_DSN=                           # optional; enable error reporting
   SENTRY_TRACES_SAMPLE_RATE=0.05
   # GPS token (optional)
   REQUIRE_GEO_TOKEN=false               # require short‑lived token for GPS punches
   GEO_TOKEN_SECRET=                     # random 32+ char secret
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Setup Database

Run this SQL in your Supabase SQL editor:

```sql
-- Attendance tracking
create table attendance_logs (
  id bigserial primary key,
  user_id text not null,
  at timestamptz not null default now(),
  type text check (type in ('in','out')) not null,
  method text check (method in ('wifi','gps','manual')) not null,
  ip text
);

-- Daily attendance summary (presence/half-day flags)
create table attendance_days (
  user_id text not null,
  day date not null,
  half_day boolean not null default false,
  primary key (user_id, day)
);

-- Network disconnect events aggregated per day
create table disconnect_events (
  id bigserial primary key,
  user_id text not null,
  day date not null,
  count int not null default 0
);

-- Leave requests
create table leave_requests (
  id bigserial primary key,
  user_id text not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- Regularization requests
create table regularizations (
  id bigserial primary key,
  user_id text not null,
  date date not null,
  reason text not null,
  kind text not null default 'attendance' check (kind in ('attendance','disconnect')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
```

## Pages

- `/` - Landing page
- `/dashboard` - Employee dashboard
- `/attendance` - Punch in/out
- `/leave` - Leave management
- `/admin/rt` - HR/Admin console (real‑time)
- `/admin/attendance` - Attendance days management (toggle half‑days)

## Tech Stack

- **Framework**: Next.js 14
- **Database**: Supabase
- **Authentication**: IP-based (from request headers)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components

## Production Hardening

- RLS and data access
  - For demos, some tables are readable by anon for charts/realtime (see `suppabase.sql`).
  - For production, apply `supabase.prod.sql` which disables anon reads and allows only the service role. Client reads go via server APIs.
  - If you adopt Supabase Auth later, switch user_id to `auth.uid()` and use the commented strict per-user RLS policies in `supabase.prod.sql`.

- GPS enforcement at server boundary
  - Because servers can’t trust client GPS, rely on IP gating for strict control: set `REQUIRE_OFFICE_FOR_ACCESS=true` with proper `OFFICE_IPS`.
  - Optional: set `REQUIRE_GEO_TOKEN=true` with `GEO_TOKEN_SECRET` to require a short‑lived, server-signed location token from `/api/network/geo/check` for GPS punches.

- Rate limiting and validation
  - All API routes use Zod validation and lightweight in‑memory rate limiting. Tune limits in `src/lib/rate.ts` as needed.

- Monitoring/tests
  - Set `SENTRY_DSN` to enable error capture. Errors in API routes are captured via `src/lib/monitoring.ts`.
  - Minimal integration tests live under `src/tests`. Run `npm run test`.

## Deployment

Deploy on [Vercel](https://vercel.com/new) for the best experience.
