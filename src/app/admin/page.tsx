"use client";
import React from "react";

type Leave = { id: string; user_id: string; start_date: string; end_date: string; reason?: string; status: string };
type Reg = { id: string; user_id: string; date: string; reason: string; kind: string; status: string };

export default function AdminPage() {
  const [leaves, setLeaves] = React.useState<Leave[]>([]);
  const [regs, setRegs] = React.useState<Reg[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/admin/requests", { cache: "no-store" });
    const data = await res.json();
    setLeaves(data.leaves || []);
    setRegs(data.regularizations || []);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // Log access
  React.useEffect(() => {
    (async () => {
      try {
        await fetch("/api/log/access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/admin" }),
        });
      } catch {}
    })();
  }, []);

  const act = async (kind: "leave" | "regularization", id: string, action: "approve" | "reject") => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await load();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">HR Console</h1>
        <div className="flex gap-2">
          <a href="/admin/logs" className="btn">View Access Logs</a>
        </div>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-3">Pending Leaves</h2>
          {leaves.length === 0 && <div className="text-sm text-gray-500">None</div>}
          <div className="space-y-2">
            {leaves.map((l) => (
              <div key={l.id} className="p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{l.user_id}</div>
                  <div className="text-sm">{l.start_date} → {l.end_date}</div>
                  {l.reason && <div className="text-xs text-gray-500">{l.reason}</div>}
                </div>
                <div className="flex gap-2">
                  <button disabled={loading} className="btn btn-primary" onClick={() => act("leave", l.id, "approve")}>Approve</button>
                  <button disabled={loading} className="btn" onClick={() => act("leave", l.id, "reject")}>Reject</button>
                </div>
              </div>
            ))}
          </div>
          {msg && <div className="text-sm mt-2">{msg}</div>}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-3">Pending Regularizations</h2>
          {regs.length === 0 && <div className="text-sm text-gray-500">None</div>}
          <div className="space-y-2">
            {regs.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{r.user_id}</div>
                  <div className="text-sm">{r.date} · {r.kind}</div>
                  <div className="text-xs text-gray-500">{r.reason}</div>
                </div>
                <div className="flex gap-2">
                  <button disabled={loading} className="btn btn-primary" onClick={() => act("regularization", r.id, "approve")}>Approve</button>
                  <button disabled={loading} className="btn" onClick={() => act("regularization", r.id, "reject")}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
