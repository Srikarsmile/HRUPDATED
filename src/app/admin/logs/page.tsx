"use client";
import React from "react";

type Log = { id: number; user_id: string; ip: string | null; path: string; at: string };

export default function AdminLogsPage() {
  const [logs, setLogs] = React.useState<Log[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [limit, setLimit] = React.useState(200);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/log/access?limit=${limit}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load logs");
      setLogs(data.items || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Access Logs</h1>
          <div className="flex items-center gap-2">
            <select className="input w-28" value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))}>
              {[50, 100, 200, 500, 1000].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <button className="btn" onClick={load}>Refresh</button>
          </div>
        </div>

        <div className="card p-4 overflow-auto">
          {loading && <div>Loading…</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-black/10 dark:border-white/10">
                  <th className="py-2 pr-2">Time</th>
                  <th className="py-2 pr-2">Path</th>
                  <th className="py-2 pr-2">IP</th>
                  <th className="py-2 pr-2">User</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-1 pr-2 whitespace-nowrap">{new Date(l.at).toLocaleString()}</td>
                    <td className="py-1 pr-2">{l.path}</td>
                    <td className="py-1 pr-2">{l.ip || "—"}</td>
                    <td className="py-1 pr-2">{l.user_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-xs text-gray-500">Only HR/Admin can view this page.</div>
      </div>
    </div>
  );
}

