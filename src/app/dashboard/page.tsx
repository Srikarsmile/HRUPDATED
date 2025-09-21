"use client";
import React from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { supabase } from "@/lib/supabase";

type Range = "today" | "week" | "month";
type MyKPI = { presentPct: number; halfDays: number; pending: number; unit: string; recent: number[] };
type MyEvent = { id: string; date: string; kind: "in" | "out"; method?: string };
type MyRequest = { id: string; kind: "leave" | "regularization"; status: string; label: string; date_from?: string; date_to?: string };
type EmployeeProfile = { user_id: string; name: string | null; email: string | null; department: string | null; employee_id: string | null; found: boolean };

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f2937" },
    secondary: { main: "#0ea5e9" },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    info: { main: "#3b82f6" },
    /* Set white background */
    background: { default: "#ffffff", paper: "#fff" },
    divider: "#e7e7ef",
  },
  shape: { borderRadius: 12 },
  typography: { button: { textTransform: "none", fontWeight: 700 } },
});

function MiniStat({ label, value, color }: { label: string; value: string; color: "primary" | "secondary" | "success" | "warning" | "error" | "info" }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="overline" color={`${color}.main`}>{label}</Typography>
        <Typography variant="h5" fontWeight={800}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

function LeaveForm({ onSubmit }: { onSubmit: (payload: any) => Promise<void> }) {
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField label="From" type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)} sx={{ width: 180 }} InputLabelProps={{ shrink: true }} />
          <TextField label="To" type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)} sx={{ width: 180 }} InputLabelProps={{ shrink: true }} />
          <TextField label="Reason (optional)" size="small" value={note} onChange={(e) => setNote(e.target.value)} sx={{ flex: 1 }} />
          <Button variant="contained" disabled={saving} onClick={async () => { setSaving(true); await onSubmit({ start_date: from, end_date: to, reason: note }); setSaving(false); }}>Apply Leave</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function RegularizationForm({ onSubmit }: { onSubmit: (payload: any) => Promise<void> }) {
  const [date, setDate] = React.useState("");
  const [reason, setReason] = React.useState("Missed punch");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField label="Date" type="date" size="small" value={date} onChange={(e) => setDate(e.target.value)} sx={{ width: 180 }} InputLabelProps={{ shrink: true }} />
          <TextField label="Reason" select size="small" value={reason} onChange={(e) => setReason(e.target.value)} sx={{ width: 220 }}>
            <MenuItem value="Missed punch">Missed punch</MenuItem>
            <MenuItem value="Disconnect">Disconnect</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField label="Note (optional)" size="small" value={note} onChange={(e) => setNote(e.target.value)} sx={{ flex: 1 }} />
          <Button variant="outlined" disabled={saving} onClick={async () => { setSaving(true); await onSubmit({ date, reason, kind: reason === "Disconnect" ? "disconnect" : "attendance", note }); setSaving(false); }}>Submit</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function EmployeeDashboard() {
  const [range, setRange] = React.useState<Range>("today");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [wifiAllowed, setWifiAllowed] = React.useState<boolean | null>(null);

  const [kpi, setKpi] = React.useState<MyKPI | null>(null);
  const [events, setEvents] = React.useState<MyEvent[]>([]);
  const [recent, setRecent] = React.useState<MyRequest[]>([]);
  const [employee, setEmployee] = React.useState<EmployeeProfile | null>(null);
  const [demoMode, setDemoMode] = React.useState<boolean>(false);

  const [toast, setToast] = React.useState<{ open: boolean; msg: string; sev: "success" | "error" | "info" }>({ open: false, msg: "", sev: "success" });
  const [punchLoading, setPunchLoading] = React.useState<boolean>(false);

  function computeRangeStrings(r: Range) {
    const now = new Date();
    if (r === "today") {
      const d = now.toISOString().slice(0, 10);
      return { from: d, to: d };
    }
    if (r === "week") {
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: monday.toISOString().slice(0, 10), to: sunday.toISOString().slice(0, 10) };
    }
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
  }

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);

      if (demoMode) {
        // Load demo data
        const demoRes = await fetch("/api/demo/employee", { cache: "no-store" });
        const demoData = await demoRes.json();

        if (!demoRes.ok) throw new Error(demoData.error || "Failed to load demo data");

        setEmployee(demoData.profile);
        setWifiAllowed(demoData.networkStatus.allowed);

        const presentPct = Number(demoData.kpis.attendancePercent || 0);
        const halfPct = Number(demoData.kpis.halfPct || 0);
        const recentBars = Array.from({ length: 7 }, () => presentPct);
        setKpi({ presentPct, halfDays: Math.round(halfPct), pending: Number(demoData.kpis.pending || 0), unit: range === "month" ? "weeks" : "days", recent: recentBars });

        // Recent requests
        const reqs: MyRequest[] = [
          ...(demoData.leaveRequests.items || []).map((x: any) => ({ id: String(x.id), kind: "leave" as const, status: x.status, label: `${x.start_date} → ${x.end_date}`, date_from: x.start_date, date_to: x.end_date })),
          ...(demoData.regularizations.items || []).map((x: any) => ({ id: String(x.id), kind: "regularization" as const, status: x.status, label: x.reason, date_from: x.date })),
        ].slice(0, 8);
        setRecent(reqs);

        // Demo attendance events
        const evs: MyEvent[] = (demoData.attendanceEvents || []).map((row: any) => ({ id: String(row.id), date: new Date(row.at).toLocaleString(), kind: row.type, method: row.method }));
        setEvents(evs);

        setLoading(false);
        return;
      }

      // Load real data
      const [kpiRes, leaveRes, regRes, whoRes, profileRes] = await Promise.all([
        fetch("/api/kpis", { cache: "no-store" }),
        fetch("/api/leave", { cache: "no-store" }),
        fetch("/api/regularizations", { cache: "no-store" }),
        fetch("/api/whoami", { cache: "no-store" }),
        fetch("/api/employee/profile", { cache: "no-store" }),
      ]);
      const k = await kpiRes.json();
      const l = await leaveRes.json();
      const r = await regRes.json();
      const who = await whoRes.json();
      const profile = await profileRes.json();

      setEmployee(profile);

      const presentPct = Number(k.attendancePercent || 0);
      const halfPct = Number(k.halfPct || 0);
      const recentBars = Array.from({ length: 7 }, () => presentPct);
      setKpi({ presentPct, halfDays: Math.round(halfPct), pending: Number(k.pending || 0), unit: range === "month" ? "weeks" : "days", recent: recentBars });

      // Recent requests (last 8)
      const reqs: MyRequest[] = [
        ...(l.items || []).map((x: any) => ({ id: String(x.id), kind: "leave" as const, status: x.status, label: `${x.start_date} → ${x.end_date}`, date_from: x.start_date, date_to: x.end_date })),
        ...(r.items || []).map((x: any) => ({ id: String(x.id), kind: "regularization" as const, status: x.status, label: x.reason, date_from: x.date })),
      ].slice(0, 8);
      setRecent(reqs);

      // Attendance punch logs (read-only from supabase anon)
      const { from, to } = computeRangeStrings(range);
      if (who?.userId && supabase) {
        const { data } = await supabase
          .from("attendance_logs")
          .select("id,at,type,method")
          .eq("user_id", who.userId)
          .gte("at", new Date(from).toISOString())
          .lte("at", new Date(new Date(to).getTime() + 24 * 3600 * 1000 - 1).toISOString())
          .order("at", { ascending: false })
          .limit(10);
        const evs: MyEvent[] = (data || []).map((row: any) => ({ id: String(row.id), date: new Date(row.at).toLocaleString(), kind: row.type, method: row.method }));
        setEvents(evs);
      } else {
        setEvents([]);
      }

      // Network status
      try {
        const nc = await fetch("/api/network/check", { cache: "no-store" }).then((r) => r.json());
        setWifiAllowed(!!nc.allowed);
      } catch {
        setWifiAllowed(null);
      }

      setLoading(false);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadAll();

    // Only set up real-time subscriptions if not in demo mode
    if (!demoMode) {
      const ch = supabase
        .channel("emp-dashboard")
        .on("postgres_changes", { event: "*", schema: "public", table: "attendance_days" }, () => loadAll())
        .on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, () => loadAll())
        .on("postgres_changes", { event: "*", schema: "public", table: "regularizations" }, () => loadAll())
        .on("postgres_changes", { event: "*", schema: "public", table: "disconnect_events" }, () => loadAll())
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [range, demoMode]);

  async function applyLeave(payload: any) {
    try {
      const res = await fetch("/api/leave", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setToast({ open: true, sev: "success", msg: "Leave request submitted" });
      await loadAll();
    } catch (e: any) {
      setToast({ open: true, sev: "error", msg: e?.message || "Failed to submit" });
    }
  }
  async function submitReg(payload: any) {
    try {
      const res = await fetch("/api/regularizations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setToast({ open: true, sev: "success", msg: "Regularization submitted" });
      await loadAll();
    } catch (e: any) {
      setToast({ open: true, sev: "error", msg: e?.message || "Failed to submit" });
    }
  }

  async function doPunch(type: "in" | "out") {
    try {
      setPunchLoading(true);
      const res = await fetch("/api/attendance/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, method: "wifi" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Punch failed");
      const when = data?.log?.at ? new Date(data.log.at).toLocaleTimeString() : new Date().toLocaleTimeString();
      setToast({ open: true, sev: "success", msg: `Punched ${type.toUpperCase()} at ${when}` });
      await loadAll();
    } catch (e: any) {
      setToast({ open: true, sev: "error", msg: e?.message || "Punch failed" });
    } finally {
      setPunchLoading(false);
    }
  }

  const bars = (kpi?.recent || []).map((v, i) => (
    <Box key={i} sx={{ flex: 1, height: 72, position: "relative" }}>
      <Box sx={(t) => ({ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "70%", height: 10, borderRadius: 999, backgroundColor: t.palette.action.selected, border: `1px solid ${t.palette.divider}` })} />
      <Box sx={(t) => ({ position: "absolute", bottom: 0, left: 0, right: 0, height: `${v}%`, bgcolor: t.palette.secondary.main, opacity: 0.9, borderTopLeftRadius: 8, borderTopRightRadius: 8 })} />
      <Box sx={(t) => ({ position: "absolute", inset: 0, borderRadius: 6, border: `1px solid ${t.palette.divider}`, backgroundColor: t.palette.action.hover })} />
    </Box>
  ));

  return (
    <ThemeProvider theme={theme}>
      <Container sx={{ py: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4" fontWeight={800}>
                {employee?.name ? `Welcome, ${employee.name}` : "My Dashboard"}
              </Typography>
              {demoMode && (
                <Chip
                  label="DEMO"
                  color="warning"
                  size="small"
                  variant="filled"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
            <Typography color="text.secondary">
              {employee?.department && employee?.employee_id
                ? `${employee.department} • ${employee.employee_id} • Attendance • Leave • Regularization`
                : "Attendance • Leave • Regularization"
              }
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  color="warning"
                />
              }
              label="Demo Data"
              sx={{ margin: 0 }}
            />
            <ToggleButtonGroup value={range} exclusive onChange={(e, v) => v && setRange(v)} size="small" color="secondary">
              <ToggleButton value="today"><TodayRoundedIcon sx={{ mr: 0.5 }} />Today</ToggleButton>
              <ToggleButton value="week"><CalendarMonthRoundedIcon sx={{ mr: 0.5 }} />Week</ToggleButton>
              <ToggleButton value="month"><AccessTimeRoundedIcon sx={{ mr: 0.5 }} />Month</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Grid container spacing={2} sx={{ mb: 1 }}>
            {[0, 1, 2, 3].map((i) => (
              <Grid item xs={12} md={3} key={i}><Skeleton variant="rounded" height={96} /></Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}><MiniStat label="Present" value={`${kpi?.presentPct ?? 0}%`} color="success" /></Grid>
            <Grid item xs={12} md={4}><MiniStat label="Half‑days (this period)" value={`${kpi?.halfDays ?? 0}`} color="warning" /></Grid>
            <Grid item xs={12} md={4}><MiniStat label="Pending requests" value={`${kpi?.pending ?? 0}`} color="info" /></Grid>
          </Grid>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ position: "relative", overflow: "hidden" }}>
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.8 }}>{range === "today" ? "Today" : range === "week" ? "This Week" : "This Month"}</Typography>
                    <Typography variant="h6" fontWeight={700}>Attendance Overview</Typography>
                  </Box>
                  <Chip icon={<TimelineRoundedIcon />} label={`Last 7 ${kpi?.unit || "days"}`} size="small" color="info" variant="outlined" />
                </Stack>
                <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ mt: 2 }}>
                  {loading ? <Skeleton variant="rounded" width="100%" height={72} /> : bars}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={1.2}>
                  {[{ label: "Present", val: kpi?.presentPct ?? 0, color: "success" }, { label: "Half‑Day", val: kpi?.halfDays ?? 0, color: "warning" }, { label: "Pending", val: kpi?.pending ?? 0, color: "info" }].map((s) => (
                    <Grid item xs={4} key={s.label}>
                      <Box sx={(t) => ({ p: 1.2, textAlign: "center", borderRadius: 1.5, bgcolor: alpha((t.palette as any)[s.color].main, t.palette.mode === "light" ? 0.08 : 0.18), color: (t.palette as any)[s.color].main, border: "1px solid", borderColor: alpha((t.palette as any)[s.color].main, 0.25) })}>
                        <Typography variant="h6" fontWeight={800} lineHeight={1}>{s.val}{s.label === "Present" ? "%" : ""}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>{s.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Presence</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                  <Chip icon={<WifiRoundedIcon />} label={wifiAllowed === null ? "Wi‑Fi —" : wifiAllowed ? "Wi‑Fi verified" : "Wi‑Fi not allowed"} color={wifiAllowed ? "success" : "warning"} variant="filled" />
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">Quick actions</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                  <Button variant="contained" disabled={punchLoading || !wifiAllowed} onClick={() => doPunch("in")}>Punch In</Button>
                  <Button variant="outlined" disabled={punchLoading || !wifiAllowed} onClick={() => doPunch("out")}>Punch Out</Button>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">Quick history</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {(loading ? Array.from({ length: 3 }) : events.slice(0, 5)).map((e: any, i: number) => (
                    <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                      {loading ? <Skeleton width={160} /> : <Typography>{e.date}</Typography>}
                      {loading ? <Skeleton width={60} /> : <Chip size="small" color={e.kind === "in" ? "success" : "default"} label={e.kind.toUpperCase()} />}
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <LeaveForm onSubmit={applyLeave} />
          </Grid>

          <Grid item xs={12}>
            <RegularizationForm onSubmit={submitReg} />
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                  <Typography variant="h6" fontWeight={700}>My recent requests</Typography>
                  <Chip label="Auto half‑day after >2 disconnects/day" size="small" color="warning" variant="outlined" icon={<ErrorRoundedIcon />} />
                </Stack>
                <Divider sx={{ my: 2 }} />
                {loading ? <Skeleton variant="rounded" height={140} /> : (
                  <Grid container spacing={2}>
                    {recent.map((r) => (
                      <Grid item xs={12} sm={6} md={3} key={r.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Chip size="small" color={r.kind === "leave" ? "info" : "secondary"} label={r.kind} />
                              <Chip size="small" color={r.status === "approved" ? "success" : r.status === "pending" ? "warning" : "default"} label={r.status} />
                            </Stack>
                            <Typography variant="subtitle2" sx={{ mt: 1 }}>{r.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{r.date_from}{r.date_to ? ` → ${r.date_to}` : ""}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Snackbar open={toast.open} autoHideDuration={2500} onClose={() => setToast({ ...toast, open: false })}>
          <Alert severity={toast.sev} onClose={() => setToast({ ...toast, open: false })}>{toast.msg}</Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
