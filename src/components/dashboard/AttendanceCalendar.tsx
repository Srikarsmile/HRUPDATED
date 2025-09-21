"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type DayItem = { day: string; status: "present" | "half" | "absent"; disconnects: number };

function monthBounds(d: Date) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { first, last };
}

export default function AttendanceCalendar() {
  const [items, setItems] = React.useState<DayItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const now = new Date();
  const { first, last } = monthBounds(now);
  const from = first.toISOString().slice(0, 10);
  const to = last.toISOString().slice(0, 10);

  const currentMonth = now.toLocaleString(undefined, { month: "long", year: "numeric" });
  const daysInMonth = last.getDate();
  const startDay = first.getDay(); // 0=Sun

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/attendance/days?from=${from}&to=${to}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load attendance days");
        setItems(data.items || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load attendance");
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to]);

  const byDay = new Map<string, DayItem>();
  items.forEach((it) => byDay.set(it.day, it));

  const present = items.filter((i) => i.status === "present").length;
  const half = items.filter((i) => i.status === "half").length;
  const absent = items.filter((i) => i.status === "absent").length;
  const considered = present + half + absent;
  const attendanceRate = considered > 0 ? Math.round(((present + 0.5 * half) / considered) * 100) : 0;

  const statusClass = (s: DayItem["status"], isToday: boolean) => {
    const base = "relative w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200";
    if (isToday) return cn(base, "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800");
    if (s === "present") return cn(base, "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/30");
    if (s === "half") return cn(base, "bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700/30");
    return cn(base, "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700/30");
  };

  const iconFor = (s: DayItem["status"]) => (s === "present" ? "✓" : s === "half" ? "½" : "");

  return (
    <Card variant="floating" size="lg" animate className="group relative overflow-hidden">
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📅</span>
            </div>
            <div>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Attendance Summary</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{currentMonth}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">{attendanceRate}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overall Rate</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "present", label: "Present", value: present, gradient: "from-green-500 to-emerald-600" },
            { key: "half", label: "Half‑day", value: half, gradient: "from-yellow-500 to-amber-600" },
            { key: "absent", label: "Absent", value: absent, gradient: "from-red-500 to-rose-600" },
          ].map((stat) => (
            <div key={stat.key} className={cn("relative overflow-hidden rounded-xl p-4 border border-white/20 dark:border-gray-700/30", `bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30`)}>
              <div className="relative z-10 text-center">
                <div className={cn("text-2xl font-bold mb-1", `bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`)}>{stat.value}</div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-xs text-gray-500 dark:text-gray-400 text-center">{d}</div>
          ))}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const key = new Date(now.getFullYear(), now.getMonth(), dayNum).toISOString().slice(0, 10);
            const it = byDay.get(key);
            const status = it?.status || "absent";
            const isToday = new Date().toDateString() === new Date(now.getFullYear(), now.getMonth(), dayNum).toDateString();
            return (
              <div key={key} className={statusClass(status, isToday)} title={it ? `${key} • ${status}${it.disconnects ? ` • ${it.disconnects} disconnects` : ""}` : key}>
                <span>{dayNum}</span>
                <span className="absolute bottom-1 right-1 text-xs opacity-80">{iconFor(status)}</span>
              </div>
            );
          })}
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {loading && <div className="text-sm text-gray-500">Loading…</div>}
      </CardContent>
    </Card>
  );
}

