"use client";
import React from "react";
import Link from "next/link";
// Clerk removed – IP-based auth now
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
  LinearProgress,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  CssBaseline,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { supabase } from "@/lib/supabase";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

type Range = "today" | "week" | "month";
type Summary = {
  presentPct: number;
  halfPct: number;
  absentPct: number;
  todayDisconnects: number;
  pendingApprovals: number;
  recent: number[];
};

const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === "light" ? "#4f46e5" : "#c7d2fe" },
      secondary: { main: mode === "light" ? "#0ea5e9" : "#7dd3fc" },
      success: { main: "#10b981" },
      warning: { main: "#f59e0b" },
      error: { main: "#ef4444" },
      background: { default: mode === "light" ? "#f6f7fb" : "#0b1020", paper: mode === "light" ? "#fff" : "#0f172a" },
      divider: mode === "light" ? "#e7e7ef" : "#22304b",
    },
    shape: { borderRadius: 12 },
    typography: { button: { textTransform: "none", fontWeight: 700 } },
  });

export default function DashboardPage() {
  const [mode, setMode] = React.useState<"light" | "dark">("light");
  const [range, setRange] = React.useState<Range>("today");
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [approvals, setApprovals] = React.useState<{ id: string; employee: string; type: string; date: string; status: string }[]>([]);
  const [disconnects] = React.useState<{ id: string; employee: string; count: number; date: string }[]>([]);
  const [who, setWho] = React.useState<{ ip: string | null; role: string } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // KPIs
        const kpiRes = await fetch("/api/kpis", { cache: "no-store" });
        const kpi = await kpiRes.json();
        const att = Number(kpi.attendancePercent || 0);
        const pend = Number(kpi.pending || 0);

        // Build a flat 7-bar series using attendance percent
        const recent = Array.from({ length: 7 }, () => att);

        // Try to load pending approvals (if HR/Admin)
        let appr: { id: string; employee: string; type: string; date: string; status: string }[] = [];
        try {
          const aRes = await fetch("/api/admin/requests", { cache: "no-store" });
          if (aRes.ok) {
            const a = await aRes.json();
            const leaves = (a.leaves || []).map((l: any) => ({ id: String(l.id), employee: l.user_id, type: "Leave", date: l.start_date, status: l.status }));
            const regs = (a.regularizations || []).map((r: any) => ({ id: String(r.id), employee: r.user_id, type: "Regularization", date: r.date, status: r.status }));
            appr = [...leaves, ...regs];
          }
        } catch {}

        if (!cancelled) {
          setSummary({ presentPct: att, halfPct: 0, absentPct: Math.max(0, 100 - att), todayDisconnects: 0, pendingApprovals: pend, recent });
          setApprovals(appr);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load dashboard");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [range]);

  // Who am I (IP + role)
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/whoami", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setWho({ ip: data.ip || null, role: data.role || "employee" });
        }
      } catch {}
    })();
  }, []);

  // Log access
  React.useEffect(() => {
    (async () => {
      try {
        await fetch("/api/log/access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/dashboard" }),
        });
      } catch {}
    })();
  }, []);

  // Supabase realtime: refresh on relevant table changes
  React.useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance_days" },
        () => setRange((r) => r)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leave_requests" },
        () => setRange((r) => r)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "regularizations" },
        () => setRange((r) => r)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "disconnect_events" },
        () => setRange((r) => r)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const show = (val?: number) => (typeof val === "number" && !Number.isNaN(val) ? val : 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ py: 4 }}>
        {/* Header */}
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Dashboard</Typography>
            <Typography color="text.secondary">Wi‑Fi attendance • Approvals • Insights</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <ToggleButtonGroup value={range} exclusive onChange={(e, v) => v && setRange(v)} size="small" color="secondary">
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={() => setMode(mode === "light" ? "dark" : "light")}>
              {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
            {who && (
              <Chip
                icon={<ShieldRoundedIcon />}
                color={who.role === "hr" ? "secondary" : "default"}
                label={`${who.role.toUpperCase()}${who.ip ? ` • ${who.ip}` : ""}`}
              />
            )}
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && summary && (
          <Grid container spacing={2}>
            {[
              { label: "Present", value: summary.presentPct, color: "success" as const, icon: <CheckCircleRoundedIcon /> },
              { label: "Half‑Day", value: summary.halfPct, color: "warning" as const, icon: <TimelineRoundedIcon /> },
              { label: "Absent", value: summary.absentPct, color: "error" as const, icon: <ReportRoundedIcon /> },
            ].map((k) => (
              <Grid item xs={12} md={4} key={k.label}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {k.icon}
                        <Typography variant="subtitle2" color="text.secondary">{k.label}</Typography>
                      </Stack>
                      <Typography variant="h4" fontWeight={800}>{show(k.value)}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={show(k.value)} color={k.color} sx={{ height: 10, borderRadius: 999 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Attendance Overview + Status */}
            <Grid item xs={12} md={7}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h6">Attendance Overview</Typography>
                    <Chip size="small" icon={<WifiRoundedIcon />} label={range === "today" ? "Today" : range === "week" ? "This Week" : "This Month"} />
                  </Stack>
                  {[
                    { label: "Present", value: summary.presentPct, color: "success" as const },
                    { label: "Half‑Day", value: summary.halfPct, color: "warning" as const },
                    { label: "Absent", value: summary.absentPct, color: "error" as const },
                  ].map((s) => (
                    <Box key={s.label} sx={{ mb: 1.25 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                        <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                        <Typography variant="body2" fontWeight={700}>{show(s.value)}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={show(s.value)} color={s.color} sx={{ height: 10, borderRadius: 999 }} />
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary">Last 7 periods</Typography>
                  <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ mt: 1 }}>
                    {summary.recent.map((v, i) => (
                      <Box key={i} sx={{ flex: 1, height: 80, position: "relative", bgcolor: "action.hover", borderRadius: 1 }}>
                        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${show(v)}%`, bgcolor: "secondary.main", opacity: 0.85, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>Status</Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
                    <Chip color="success" label={`Wi‑Fi OK`} icon={<CheckCircleRoundedIcon />} />
                    <Chip color="warning" label={`Disconnects: ${show(summary.todayDisconnects)}`} />
                    <Chip color="info" label={`Approvals: ${show(summary.pendingApprovals)}`} />
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Recent disconnects</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {disconnects.map((d) => (
                        <TableRow key={d.id} hover>
                          <TableCell>{d.employee}</TableCell>
                          <TableCell align="right">{show(d.count)}</TableCell>
                          <TableCell>{d.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            {/* Approvals */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h6">Approvals</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" startIcon={<TimelineRoundedIcon />} component={Link} href="/regularizations">View Policies</Button>
                      <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} component={Link} href="/admin">Open HR Console</Button>
                    </Stack>
                  </Stack>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {approvals.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <Typography variant="body2" color="text.secondary">No pending approvals or insufficient permissions.</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {approvals.map((r) => (
                        <TableRow key={r.id} hover>
                          <TableCell>{r.employee}</TableCell>
                          <TableCell>{r.type}</TableCell>
                          <TableCell>{r.date}</TableCell>
                          <TableCell>
                            <Chip size="small" color={r.status === "approved" ? "success" : r.status === "rejected" ? "error" : "warning"} label={r.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  );
}
