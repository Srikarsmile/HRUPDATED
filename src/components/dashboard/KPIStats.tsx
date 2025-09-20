"use client";
import React from "react";

type KPI = {
  label: string;
  value: string;
  trend?: string;
  color: string; // Tailwind gradient from..to.. classes
  sublabel?: string;
  icon: string; // emoji for simplicity
};

export default function KPIStats() {
  const [attendancePercent, setAttendancePercent] = React.useState<number>(0);
  const [pending, setPending] = React.useState<number>(0);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/kpis", { cache: "no-store" });
        const data = await res.json();
        setAttendancePercent(data.attendancePercent ?? 0);
        setPending(data.pending ?? 0);
      } catch {}
    })();
  }, []);

  const KPIS: KPI[] = [
    { label: "Attendance", value: `${attendancePercent}%`, trend: undefined, color: "from-green-500 to-emerald-600", sublabel: "This month", icon: "📈" },
    { label: "Leave Balance", value: "—", color: "from-blue-500 to-cyan-600", sublabel: "Days available", icon: "🗓️" },
    { label: "Pending", value: String(pending), color: "from-purple-500 to-fuchsia-600", sublabel: "Awaiting approval", icon: "⏳" },
    { label: "Holidays", value: "2", color: "from-amber-500 to-orange-600", sublabel: "Upcoming", icon: "🎉" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {KPIS.map((kpi) => (
        <div key={kpi.label} className="relative overflow-hidden card p-4">
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${kpi.color} opacity-10`}></div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">{kpi.label}</div>
              <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">{kpi.value}</div>
              {kpi.sublabel && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{kpi.sublabel}</div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${kpi.color} text-white flex items-center justify-center text-xl shadow-md`}>{kpi.icon}</div>
          </div>
          {kpi.trend && (
            <div className="mt-3 inline-flex items-center text-xs font-semibold text-green-600 dark:text-green-400">
              ▲ {kpi.trend} vs last month
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
