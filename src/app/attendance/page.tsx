"use client";
import React from "react";

type CheckResp = { allowed: boolean; ip?: string };

export default function AttendancePage() {
  const [loading, setLoading] = React.useState(false);
  const [allowed, setAllowed] = React.useState<boolean | null>(null);
  const [ip, setIp] = React.useState<string | undefined>(undefined);
  const [message, setMessage] = React.useState<string | null>(null);

  const checkNetwork = React.useCallback(async () => {
    try {
      const res = await fetch("/api/network/check", { cache: "no-store" });
      const data: CheckResp = await res.json();
      setAllowed(data.allowed);
      setIp(data.ip);
    } catch (e) {
      setAllowed(false);
    }
  }, []);

  React.useEffect(() => {
    checkNetwork();
  }, [checkNetwork]);

  const punch = async (type: "in" | "out") => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/attendance/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, method: "wifi" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage(`${type.toUpperCase()} recorded at ${new Date(data?.log?.at || Date.now()).toLocaleTimeString()}`);
      await checkNetwork();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const recordDisconnect = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/attendance/disconnect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage("Disconnect recorded");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-2xl mx-auto">
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-bold">Attendance</h2>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Network: {allowed === null ? "checking..." : allowed ? "Office Wi‑Fi (allowed)" : "Not on office network"}
            {ip ? <span className="ml-2 text-gray-400">({ip})</span> : null}
          </div>
          <div className="flex gap-3">
            <button disabled={loading || !allowed} onClick={() => punch("in")} className="btn btn-primary disabled:opacity-50">Punch In</button>
            <button disabled={loading || !allowed} onClick={() => punch("out")} className="btn btn-secondary disabled:opacity-50">Punch Out</button>
            <button disabled={loading} onClick={recordDisconnect} className="btn disabled:opacity-50">Record Disconnect</button>
          </div>
          {message && (
            <div className="text-sm text-gray-700 dark:text-gray-300">{message}</div>
          )}
          <div className="text-xs text-gray-500">
            Note: In/out requires office Wi‑Fi per policy. Disconnects {'>'} 2/day auto mark half‑day.
          </div>
        </div>
      </div>
    </div>
  );
}
