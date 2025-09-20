"use client";
import { useMemo, useEffect, useState } from "react";

export default function WelcomeBanner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { greeting, dateStr, name } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const dateStr = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(now);
    const name = "there";
    return { greeting, dateStr, name };
  }, []);

  return (
    <div className="mb-8 card p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 border border-blue-200/50 dark:border-blue-800/30">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {mounted ? (
              <span suppressHydrationWarning>{greeting}, {name}! 👋</span>
            ) : (
              "Welcome back! 👋"
            )}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {mounted ? (
              <>
                Today is <span className="font-semibold" suppressHydrationWarning>{dateStr}</span> — have a productive day.
              </>
            ) : (
              "Have a productive day."
            )}
          </p>
        </div>
        <div className="hidden lg:block">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white text-3xl">🎯</span>
          </div>
        </div>
      </div>
    </div>
  );
}
