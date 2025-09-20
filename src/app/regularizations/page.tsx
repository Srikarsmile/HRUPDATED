"use client";
import React from "react";

type Item = { id: string; date: string; reason: string; kind: string; status: string };

export default function RegularizationsPage() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ date: "", reason: "", kind: "attendance" });
  const [msg, setMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/regularizations", { cache: "no-store" });
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
      const res = await fetch("/api/regularizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm({ date: "", reason: "", kind: "attendance" });
      await load();
      setMsg("Regularization submitted");
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
          <h2 className="text-xl font-bold mb-4">Submit Regularization</h2>
          <form onSubmit={submit} className="space-y-3">
            <div className="flex gap-3">
              <input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              <select className="input" value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}>
                <option value="attendance">Attendance</option>
                <option value="disconnect">Disconnect</option>
              </select>
            </div>
            <textarea className="input" placeholder="Reason" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} required />
            <button className="btn btn-primary" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
            {msg && <div className="text-sm text-gray-600 dark:text-gray-300">{msg}</div>}
          </form>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-3">Your Requests</h3>
          <div className="space-y-2">
            {items.length === 0 && <div className="text-sm text-gray-500">No requests yet.</div>}
            {items.map((it) => (
              <div key={it.id} className="flex justify-between items-center p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-black/5 dark:border-white/10">
                <div>
                  <div className="font-medium">{it.date} · {it.kind}</div>
                  <div className="text-xs text-gray-500">{it.reason}</div>
                </div>
                <div className="text-sm font-semibold capitalize">{it.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

