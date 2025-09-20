"use client";
import React from "react";

type LeaveItem = { id: string; start_date: string; end_date: string; reason?: string; status: string; created_at: string };

export default function LeavePage() {
  const [items, setItems] = React.useState<LeaveItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ start_date: "", end_date: "", reason: "" });
  const [msg, setMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/leave", { cache: "no-store" });
    const data = await res.json();
    setItems(data.items || []);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm({ start_date: "", end_date: "", reason: "" });
      await load();
      setMsg("Leave request submitted");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
          <form onSubmit={submit} className="space-y-3">
            <div className="flex gap-3">
              <input type="date" className="input" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} required />
              <input type="date" className="input" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} required />
            </div>
            <textarea className="input" placeholder="Reason (optional)" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
            <button className="btn btn-primary" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
            {msg && <div className="text-sm text-gray-600 dark:text-gray-300">{msg}</div>}
          </form>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-3">Your Leave Requests</h3>
          <div className="space-y-2">
            {items.length === 0 && <div className="text-sm text-gray-500">No requests yet.</div>}
            {items.map((it) => (
              <div key={it.id} className="flex justify-between items-center p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-black/5 dark:border-white/10">
                <div>
                  <div className="font-medium">{it.start_date} → {it.end_date}</div>
                  {it.reason && <div className="text-xs text-gray-500">{it.reason}</div>}
                </div>
                <div className="text-sm font-semibold capitalize {it.status === 'pending' ? 'text-yellow-600' : it.status === 'approved' ? 'text-green-600' : 'text-red-600'}">{it.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

