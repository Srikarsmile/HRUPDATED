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
   OFFICE_IPS=your_office_ip_addresses  # Comma-separated IPs or CIDR ranges
   REQUIRE_OFFICE_FOR_ACCESS=false       # If true, only office IPs can access the app
   HR_IPS=hr_ip1,hr_ip2                  # IPs treated as HR/Admin
   EMPLOYEE_IPS=optional_allowed_ips     # Optional allowlist (restricts access)
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

## Deployment

Deploy on [Vercel](https://vercel.com/new) for the best experience.
