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
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { supabase } from "@/lib/supabase";
import KPIStats from "@/components/dashboard/KPIStats";
import AttendanceCalendar from "@/components/dashboard/AttendanceCalendar";
import QuickActions from "@/components/dashboard/QuickActions";

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


interface LeavePayload {
  start_date: string;
  end_date: string;
  reason: string;
}

function LeaveForm({ onSubmit }: { onSubmit: (payload: LeavePayload) => Promise<void> }) {
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

interface RegularizationPayload {
  date: string;
  reason: string;
  kind: string;
  note: string;
}

function RegularizationForm({ onSubmit }: { onSubmit: (payload: RegularizationPayload) => Promise<void> }) {
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
  const [geoAllowed, setGeoAllowed] = React.useState<boolean | null>(null);
  const [geoMsg, setGeoMsg] = React.useState<string>("");

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

      // Attendance punch logs (server API; avoids anon RLS reads in prod)
      const { from, to } = computeRangeStrings(range);
      try {
        const logsRes = await fetch(`/api/attendance/logs?from=${from}&to=${to}&limit=10`, { cache: "no-store" });
        const logs = await logsRes.json();
        if (logsRes.ok) {
          const evs: MyEvent[] = (logs.items || []).map((row: any) => ({ id: String(row.id), date: new Date(row.at).toLocaleString(), kind: row.type, method: row.method }));
          setEvents(evs);
        } else {
          setEvents([]);
        }
      } catch {
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
    const enableClientSupabase = String(process.env.NEXT_PUBLIC_ENABLE_CLIENT_SUPABASE || 'false') === 'true';
    if (!demoMode && enableClientSupabase) {
      const ch = supabase
        .channel("emp-dashboard")
        .on("postgres_changes", { event: "*", schema: "public", table: "attendance_days" }, () => loadAll())
        .on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, () => loadAll())
        .on("postgres_changes", { event: "*", schema: "public", table: "regularizations" }, () => loadAll())
        .on("postgres_changes", { event: "*", schema: "public", table: "disconnect_events" }, () => loadAll())
        .on("postgres_changes", { event: "*", schema: "public", table: "employees" }, () => loadAll())
        .on("postgres_changes", { event: "*", schema: "public", table: "attendance_logs" }, () => loadAll())
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [range, demoMode]);

  // Real-time geofence check using browser location
  React.useEffect(() => {
    let watchId: number | null = null;
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const onPos = async (pos: GeolocationPosition) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `/api/network/geo/check?lat=${latitude}&lng=${longitude}`;
          const res = await fetch(url, { cache: 'no-store' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Geo check failed');
          if (data.configured === false) {
            // If no fence configured, do not block access
            setGeoAllowed(true);
            setGeoMsg('');
          } else {
            setGeoAllowed(!!data.allowed);
            setGeoMsg(data.allowed ? '' : 'Come to office lazy fellow!!!');
          }
        } catch (e: any) {
          setGeoAllowed(false);
          setGeoMsg('Location check failed');
        }
      };
      const onErr = () => {
        setGeoAllowed(false);
        setGeoMsg('Location permission denied');
      };
      watchId = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
    } else {
      setGeoAllowed(false);
      setGeoMsg('Geolocation not available');
    }
    return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); };
  }, []);

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
      {/* Ensure full-page white background for dashboard */}
      <Box
        sx={{
          bgcolor: "#fff",
          minHeight: "100vh",
          "& h1, & h2, & h3, & h4, & h5, & h6": { color: "#000 !important" },
          "& .MuiTypography-root.MuiTypography-h1, & .MuiTypography-root.MuiTypography-h2, & .MuiTypography-root.MuiTypography-h3, & .MuiTypography-root.MuiTypography-h4, & .MuiTypography-root.MuiTypography-h5, & .MuiTypography-root.MuiTypography-h6": {
            color: "#000 !important",
          },
        }}
        style={{
          // Force white backgrounds within dashboard regardless of OS theme
          ['--background' as any]: '#ffffff',
          ['--card-background' as any]: '#ffffff',
          ['--surface-gradient' as any]: '#ffffff',
        }}
      >
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
              sx={{
                margin: 0,
                '.MuiFormControlLabel-label': { color: '#000 !important' },
              }}
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
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {[0, 1, 2, 3].map((i) => (
              <Grid item xs={12} md={3} key={i}><Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} /></Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ mb: 6 }}>
            <KPIStats />
          </Box>
        )}

        <Stack spacing={6}>
          {/* Main Content Grid */}
          <Grid container spacing={6}>
            <Grid item xs={12} lg={8}>
              <AttendanceCalendar />
            </Grid>
            <Grid item xs={12} lg={4}>
              <QuickActions />
            </Grid>
          </Grid>

          {/* Additional Dashboard Components */}
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Network Status</Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
                    <Chip
                      icon={<WifiRoundedIcon />}
                      label={wifiAllowed === null ? "Wi‑Fi —" : wifiAllowed ? "Wi‑Fi verified" : "Wi‑Fi not allowed"}
                      color={wifiAllowed ? "success" : "warning"}
                      variant="filled"
                      sx={{ borderRadius: 2 }}
                    />
                    <Chip
                      icon={<ErrorRoundedIcon />}
                      label={geoAllowed === null ? "GPS —" : geoAllowed ? "Inside office geofence" : "Outside geofence"}
                      color={geoAllowed ? "success" : "warning"}
                      variant="filled"
                      sx={{ borderRadius: 2 }}
                    />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Quick Punch</Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      disabled={punchLoading || !wifiAllowed}
                      onClick={() => doPunch("in")}
                      sx={{ borderRadius: 2, flex: 1, minWidth: 120 }}
                    >
                      Punch In
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={punchLoading || !wifiAllowed}
                      onClick={() => doPunch("out")}
                      sx={{ borderRadius: 2, flex: 1, minWidth: 120 }}
                    >
                      Punch Out
                    </Button>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Recent Activity</Typography>
                  <Stack spacing={1.5}>
                    {(loading ? Array.from({ length: 3 }) : events.slice(0, 4)).map((e: any, i: number) => (
                      <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                        {loading ? <Skeleton width={160} height={20} /> : <Typography variant="body2">{e.date}</Typography>}
                        {loading ? <Skeleton width={60} height={24} /> : <Chip size="small" color={e.kind === "in" ? "success" : "default"} label={e.kind.toUpperCase()} />}
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>Quick Forms</Typography>
                    <Chip label="Instant submission" size="small" color="info" variant="outlined" />
                  </Stack>

                  <Stack spacing={3}>
                    {/* Leave Form */}
                    <LeaveForm onSubmit={applyLeave} />

                    {/* Regularization Form */}
                    <RegularizationForm onSubmit={submitReg} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Requests Section */}
          <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>My Recent Requests</Typography>
                <Chip
                  label="Auto half‑day after >2 disconnects/day"
                  size="small"
                  color="warning"
                  variant="outlined"
                  icon={<ErrorRoundedIcon />}
                  sx={{ borderRadius: 2 }}
                />
              </Stack>

              {loading ? (
                <Grid container spacing={5}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                      <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={5}>
                  {recent.map((r) => (
                    <Grid item xs={12} sm={6} md={3} key={r.id}>
                      <Card variant="outlined" sx={{ borderRadius: 2, transition: "all 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: 2 } }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Chip size="small" color={r.kind === "leave" ? "info" : "secondary"} label={r.kind} />
                            <Chip
                              size="small"
                              color={r.status === "approved" ? "success" : r.status === "pending" ? "warning" : "default"}
                              label={r.status}
                            />
                          </Stack>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>{r.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.date_from}{r.date_to ? ` → ${r.date_to}` : ""}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Stack>

        {(geoAllowed === false || wifiAllowed === false) && (
          <Box sx={{ position: 'fixed', inset: 0, zIndex: 2000, bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card variant="outlined" sx={{ p: 4, maxWidth: 520 }}>
              <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Access Restricted</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{geoMsg || 'Come to office lazy fellow!!!'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Ensure you are inside the 1 km office geofence and connected via approved office network.
              </Typography>
            </Card>
          </Box>
        )}

        <Snackbar open={toast.open} autoHideDuration={2500} onClose={() => setToast({ ...toast, open: false })}>
          <Alert severity={toast.sev} onClose={() => setToast({ ...toast, open: false })}>{toast.msg}</Alert>
        </Snackbar>
      </Container>
      </Box>
    </ThemeProvider>
  );
}
