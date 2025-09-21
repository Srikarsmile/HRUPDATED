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
  IconButton,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Skeleton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import { supabase } from "@/lib/supabase";

type Range = "today" | "week" | "month";

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

type KPI = {
  pendingLeaves: number;
  pendingRegularizations: number;
  employeesPresentToday: number;
  punchesToday: number;
  halfDaysToday: number;
  disconnectsToday: number;
  weekDisconnects: number[];
  weekHalfDays: number[];
  topDisconnects: { user_id: string; count: number }[];
};

type Approval = { id: string; user_id: string; kind: "Leave" | "Regularization"; when: string; reason?: string };
type AttRow = { user_id: string; day: string; half_day: boolean; disconnects: number };
type Profile = { user_id: string; name: string | null; email?: string | null; department?: string | null; employee_id?: string | null; found?: boolean };

function KCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color={color}>{label}</Typography>
        <Typography variant="h4" fontWeight={800}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function AdminRealtimePage() {
  const [tab, setTab] = React.useState(0);
  const [range, setRange] = React.useState<Range>("today");
  const [kpi, setKpi] = React.useState<KPI | null>(null);
  const [approvals, setApprovals] = React.useState<Approval[]>([]);
  const [attRows, setAttRows] = React.useState<AttRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [demoMode, setDemoMode] = React.useState<boolean>(false);
  const [toast, setToast] = React.useState<{ open: boolean; msg: string; sev: "success" | "error" | "info" }>({ open: false, msg: "", sev: "success" });
  const [me, setMe] = React.useState<Profile | null>(null);

  const computeRange = React.useCallback(() => {
    const now = new Date();
    if (range === "today") {
      const d = now.toISOString().slice(0, 10);
      return { from: d, to: d };
    }
    if (range === "week") {
      const day = now.getDay(); // 0..6 (Sun..Sat)
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: monday.toISOString().slice(0, 10), to: sunday.toISOString().slice(0, 10) };
    }
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
  }, [range]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (demoMode) {
        // Load demo data
        const demoRes = await fetch("/api/demo/admin", { cache: "no-store" });
        const demoData = await demoRes.json();

        if (!demoRes.ok) throw new Error(demoData.error || "Failed to load demo data");

        setKpi(demoData.adminKpis);

        const leaves: Approval[] = (demoData.pendingRequests.leaves || []).map((l: any) => ({ id: String(l.id), user_id: l.user_id, kind: "Leave", when: `${l.start_date} → ${l.end_date}`, reason: l.reason }));
        const regs: Approval[] = (demoData.pendingRequests.regularizations || []).map((r: any) => ({ id: String(r.id), user_id: r.user_id, kind: "Regularization", when: r.date, reason: r.reason }));
        setApprovals([...leaves, ...regs]);

        setAttRows(demoData.attendanceData.items || []);
        setLoading(false);
        return;
      }

      // Load real data
      const [k, a] = await Promise.all([
        fetch("/api/admin/kpis", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/requests", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (k.error) throw new Error(k.error);
      setKpi(k);
      const leaves: Approval[] = (a.leaves || []).map((l: any) => ({ id: String(l.id), user_id: l.user_id, kind: "Leave", when: `${l.start_date} → ${l.end_date}`, reason: l.reason }));
      const regs: Approval[] = (a.regularizations || []).map((r: any) => ({ id: String(r.id), user_id: r.user_id, kind: "Regularization", when: r.date, reason: r.reason }));
      setApprovals([...leaves, ...regs]);
      const { from, to } = computeRange();
      const attRes = await fetch(`/api/admin/attendance?from=${from}&to=${to}`, { cache: "no-store" });
      const attJson = await attRes.json();
      if (!attRes.ok) throw new Error(attJson.error || "Failed to load attendance");
      setAttRows(attJson.items || []);
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [computeRange, demoMode]);

  React.useEffect(() => { load(); }, [load, range]);

  // Load current HR profile (for greeting)
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/employee/profile', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok) setMe(data);
      } catch {}
    })();
  }, []);

  // Realtime subscriptions for quick refresh (only in real data mode)
  React.useEffect(() => {
    const enableClientSupabase = String(process.env.NEXT_PUBLIC_ENABLE_CLIENT_SUPABASE || 'false') === 'true';
    if (!supabase || demoMode || !enableClientSupabase) return;
    const channel = supabase
      .channel("admin-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "regularizations" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_days" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "disconnect_events" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, demoMode]);

  // Realtime updates for current HR profile (greeting)
  React.useEffect(() => {
    const enableClientSupabase = String(process.env.NEXT_PUBLIC_ENABLE_CLIENT_SUPABASE || 'false') === 'true';
    if (!supabase || demoMode || !me?.user_id || !enableClientSupabase) return;
    const ch = supabase
      .channel("admin-self")
      .on("postgres_changes", { event: "*", schema: "public", table: "employees", filter: `user_id=eq.${me.user_id}` }, async () => {
        try {
          const res = await fetch('/api/employee/profile', { cache: 'no-store' });
          const data = await res.json();
          if (res.ok) setMe(data);
        } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [demoMode, me?.user_id]);

  const act = async (item: Approval, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: item.kind === "Leave" ? "leave" : "regularization", id: item.id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setToast({ open: true, msg: `${action === "approve" ? "Approved" : "Rejected"} ${item.kind} ${item.id}`, sev: "success" });
      await load();
    } catch (e: any) {
      setToast({ open: true, msg: e.message || "Failed", sev: "error" });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Ensure full-page white background for admin dashboard */}
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
          // Force white backgrounds within admin dashboard regardless of OS theme
          ['--background' as any]: '#ffffff',
          ['--card-background' as any]: '#ffffff',
          ['--surface-gradient' as any]: '#ffffff',
        }}
      >
      <Container sx={{ py: 4 }}>
        {/* Header */}
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4" fontWeight={800}>HR / Admin</Typography>
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
            <Typography color="text.secondary">Real‑time approvals • Attendance • Signals</Typography>
            <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
              {me?.name ? `Welcome, ${me.name}` : "Welcome"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
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
            <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={load}>Refresh</Button>
          </Stack>
        </Stack>

        {/* KPIs */}
        {loading ? (
          <Grid container spacing={2} sx={{ mb: 1 }}>
            {[0, 1, 2, 3].map((i) => (
              <Grid item xs={12} md={3} key={i}><Skeleton variant="rounded" height={96} /></Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} md={3}><KCard label="Employees Present" value={kpi?.employeesPresentToday ?? "—"} sub={`${kpi?.punchesToday ?? 0} punches`} color="#10b981" /></Grid>
            <Grid item xs={12} md={3}><KCard label="Half‑Days" value={kpi?.halfDaysToday ?? "—"} sub="Today" color="#f59e0b" /></Grid>
            <Grid item xs={12} md={3}><KCard label="Disconnects" value={kpi?.disconnectsToday ?? "—"} sub="Today" color="#ef4444" /></Grid>
            <Grid item xs={12} md={3}><KCard label="Pending Approvals" value={(kpi ? (kpi.pendingLeaves + kpi.pendingRegularizations) : 0)} sub={`${kpi?.pendingLeaves ?? 0} leave • ${kpi?.pendingRegularizations ?? 0} reg`} color="#6366f1" /></Grid>
          </Grid>
        )}

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab icon={<FactCheckRoundedIcon />} iconPosition="start" label="Requests" />
                <Tab icon={<TimelineRoundedIcon />} iconPosition="start" label="Attendance" />
                <Tab icon={<PeopleRoundedIcon />} iconPosition="start" label="Signals" />
              </Tabs>
              <TextField select size="small" value={range} onChange={(e) => setRange(e.target.value as Range)}>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </TextField>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {tab === 0 && (
              <Box>
                {loading ? <Skeleton variant="rounded" height={220} /> : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>When</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {approvals.length === 0 && (
                        <TableRow><TableCell colSpan={5}>No pending requests</TableCell></TableRow>
                      )}
                      {approvals.map((r) => (
                        <TableRow key={`${r.kind}-${r.id}`} hover>
                          <TableCell>{r.user_id}</TableCell>
                          <TableCell>{r.kind}</TableCell>
                          <TableCell>{r.when}</TableCell>
                          <TableCell>{r.reason || ""}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <IconButton size="small" color="success" onClick={() => act(r, "approve")}><CheckRoundedIcon /></IconButton>
                              <IconButton size="small" color="error" onClick={() => act(r, "reject")}><CloseRoundedIcon /></IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            )}

            {tab === 1 && (
              <Box>
                {loading ? <Skeleton variant="rounded" height={220} /> : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Employee</TableCell>
                        <TableCell>Half‑Day</TableCell>
                        <TableCell align="right">Disconnects</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attRows.map((a) => (
                        <TableRow key={`${a.user_id}|${a.day}`} hover>
                          <TableCell>{a.day}</TableCell>
                          <TableCell>{a.user_id}</TableCell>
                          <TableCell>{a.half_day ? <Chip size="small" color="warning" label="Half" /> : <Chip size="small" color="success" label="Full" />}</TableCell>
                          <TableCell align="right">{a.disconnects}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            )}

            {tab === 2 && (
              <Box>
                {loading ? <Skeleton variant="rounded" height={220} /> : (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Top Disconnects (7 days)</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell align="right">Disconnects</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(kpi?.topDisconnects || []).map((t) => (
                          <TableRow key={t.user_id} hover>
                            <TableCell>{t.user_id}</TableCell>
                            <TableCell align="right">{t.count}</TableCell>
                          </TableRow>
                        ))}
                        {(kpi?.topDisconnects || []).length === 0 && (
                          <TableRow><TableCell colSpan={2}>No data</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        <Snackbar open={toast.open} autoHideDuration={2200} onClose={() => setToast({ ...toast, open: false })}>
          <Alert severity={toast.sev} onClose={() => setToast({ ...toast, open: false })}>{toast.msg}</Alert>
        </Snackbar>
      </Container>
      </Box>
    </ThemeProvider>
  );
}
