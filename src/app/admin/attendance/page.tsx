"use client";
import React from "react";

type Item = { user_id: string; day: string; half_day: boolean; disconnects: number };

export default function AdminAttendancePage() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [users, setUsers] = React.useState<string[]>([]);
  const [user, setUser] = React.useState<string>("");
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (user) qs.set("user", user);
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      const res = await fetch(`/api/admin/attendance?${qs.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load attendance");
      setItems(data.items || []);
      setUsers(data.users || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, from, to]);

  React.useEffect(() => { load(); }, [load]);

  const toggleHalf = async (row: Item) => {
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: row.user_id, day: row.day, half_day: !row.half_day }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setItems((prev) => prev.map((it) => (it.user_id === row.user_id && it.day === row.day ? { ...it, half_day: !row.half_day } : it)));
    } catch (e) {
      // ignore, keep error silent here
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <a href="/admin/rt" className="btn">Back to HR Console</a>
        </div>

        <div className="card p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 dark:text-gray-400">User</label>
              <input list="users" className="input w-72" value={user} onChange={(e) => setUser(e.target.value)} placeholder="ip:127.0.0.1" />
              <datalist id="users">
                {users.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 dark:text-gray-400">From</label>
              <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 dark:text-gray-400">To</label>
              <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <button className="btn" onClick={load}>Apply</button>
          </div>
        </div>

        <div className="card p-4 overflow-auto">
          {loading && <div>Loading…</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-black/10 dark:border-white/10">
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">User</th>
                  <th className="py-2 pr-2">Half‑Day</th>
                  <th className="py-2 pr-2">Disconnects</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={`${it.user_id}|${it.day}`} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-1 pr-2 whitespace-nowrap">{it.day}</td>
                    <td className="py-1 pr-2">{it.user_id}</td>
                    <td className="py-1 pr-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${it.half_day ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {it.half_day ? 'Half' : 'Full'}
                      </span>
                    </td>
                    <td className="py-1 pr-2">{it.disconnects}</td>
                    <td className="py-1 pr-2">
                      <button className="btn btn-primary" onClick={() => toggleHalf(it)}>Toggle Half‑Day</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-xs text-gray-500">Only HR/Admin can modify attendance days.</div>
      </div>
    </div>
  );
}
