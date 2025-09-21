"use client";
import React from "react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/ui/Card";

type KPI = {
  label: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  sublabel?: string;
  icon: string;
  description?: string;
};

export default function KPIStats() {
  const [attendancePercent, setAttendancePercent] = React.useState<number>(0);
  const [pending, setPending] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/kpis", { cache: "no-store" });
        const data = await res.json();
        setAttendancePercent(data.attendancePercent ?? 0);
        setPending(data.pending ?? 0);
        await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for animation
      } catch {
        // Fallback to demo data on error
        setAttendancePercent(92);
        setPending(3);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const KPIS: KPI[] = [
    {
      label: "Attendance",
      value: `${attendancePercent}%`,
      trend: { value: 5.2, isPositive: true },
      color: "from-green-500 to-emerald-600",
      sublabel: "This month",
      icon: "📈",
      description: "Overall attendance rate"
    },
    {
      label: "Leave Balance",
      value: "12",
      trend: { value: 2.0, isPositive: false },
      color: "from-blue-500 to-cyan-600",
      sublabel: "Days available",
      icon: "🗓️",
      description: "Remaining leave days"
    },
    {
      label: "Pending",
      value: String(pending),
      color: "from-purple-500 to-fuchsia-600",
      sublabel: "Awaiting approval",
      icon: "⏳",
      description: "Pending requests"
    },
    {
      label: "Holidays",
      value: "2",
      trend: { value: 0.5, isPositive: true },
      color: "from-amber-500 to-orange-600",
      sublabel: "Upcoming",
      icon: "🎉",
      description: "Public holidays this month"
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl animate-pulse"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
      {KPIS.map((kpi, index) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatsCard
            title={kpi.label}
            value={kpi.value}
            description={kpi.sublabel}
            icon={<span className="text-2xl">{kpi.icon}</span>}
            trend={kpi.trend}
            className="h-full"
          />
        </motion.div>
      ))}
    </div>
  );
}
