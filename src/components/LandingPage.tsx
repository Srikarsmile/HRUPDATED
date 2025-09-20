"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  useScrollTrigger,
  Slide,
  CssBaseline,
  Link as MUILink,
  LinearProgress,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  SxProps,
} from "@mui/material";
import { ThemeProvider, createTheme, alpha, Theme } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import Grid from "@mui/material/GridLegacy"; // MUI v7 legacy Grid (xs/md props)
import MenuIcon from "@mui/icons-material/Menu";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { motion } from "framer-motion";
import Link from "next/link";

/**
 * NOTE: Removed `recharts` to fix Rollup bundling error in the sandbox.
 * Replaced with lightweight, dependency‑free SVG/CSS charts that render everywhere.
 */

// ===================== THEME ===================== //
const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === "light" ? "#4f46e5" : "#c7d2fe" },
      secondary: { main: mode === "light" ? "#a855f7" : "#d8b4fe" },
      success: { main: "#10b981" },
      warning: { main: "#f59e0b" },
      error: { main: "#ef4444" },
      background: {
        default: mode === "light" ? "#f6f7fb" : "#0b1020",
        paper: mode === "light" ? "#ffffff" : "#0f172a",
      },
      text: {
        primary: mode === "light" ? "#0b0f19" : "#e5e7eb",
        secondary: mode === "light" ? "#5b6470" : "#b3b9c6",
      },
      divider: mode === "light" ? "#e7e7ef" : "#22304b",
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: [
        "Inter",
        "Roboto",
        "Segoe UI",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ].join(","),
      h1: { fontWeight: 800 },
      h2: { fontWeight: 750 },
      h3: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 12 } } },
      MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
    },
  });

// ===================== HELPERS ===================== //
function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

type SectionProps = { id?: string; children: React.ReactNode; sx?: SxProps<Theme> };
const Section = ({ id, children, sx }: SectionProps) => (
  <Box id={id} component="section" sx={{ py: { xs: 8, md: 12 }, ...sx }}>
    {children}
  </Box>
);

const MotionBox = motion(Box);

// Reusable Card style
const cardBase = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: 0,
  transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
  "&:hover": { transform: "translateY(-4px)", boxShadow: 6, borderColor: "secondary.light" },
} as const;

type FeatureCardProps = { icon: React.ReactNode; title: string; desc: string };
const FeatureCard = ({ icon, title, desc }: FeatureCardProps) => (
  <Card variant="outlined" sx={cardBase}>
    <CardContent sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
      <Box sx={{ fontSize: 0 }}>{icon}</Box>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary">{desc}</Typography>
    </CardContent>
  </Card>
);

// (charts removed in favor of a simpler Attendance card)

// ===================== HERO ATTENDANCE CARD ===================== //
function AttendanceCard({
  theme,
  range,
  stats,
}: {
  theme: Theme;
  range: "today" | "week" | "month";
  stats: { present: number; half: number; absent: number; bars: number[]; unit: string };
}) {
  const label = range === "today" ? "Today" : range === "week" ? "This Week" : "This Month";

  return (
    <Card variant="outlined" sx={{ ...cardBase, p: 2, borderRadius: 0 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
          <Typography variant="h5" fontWeight={700}>Attendance</Typography>
        </Box>

        {/* Primary KPI */}
        <Box sx={{ display: "grid", placeItems: "center", my: 1 }}>
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress variant="determinate" value={stats.present} size={140} thickness={4} color="success" />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
              }}
            >
              <Typography variant="h4" fontWeight={800} lineHeight={1}>{stats.present}%</Typography>
              <Typography variant="caption" color="text.secondary">Present</Typography>
            </Box>
          </Box>
        </Box>

        {/* Compact distribution bar */}
        <Box sx={{ display: "flex", height: 10, borderRadius: 0, overflow: "hidden", border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}>
          <Box sx={{ width: `${stats.present}%`, bgcolor: alpha(theme.palette.success.main, 0.9) }} />
          <Box sx={{ width: `${stats.half}%`, bgcolor: alpha(theme.palette.warning.main, 0.9) }} />
          <Box sx={{ width: `${stats.absent}%`, bgcolor: alpha(theme.palette.error.main, 0.9) }} />
        </Box>

        {/* Breakdown */}
        <Stack spacing={1}>
          {[{ label: "Present", value: stats.present, color: "success" as const }, { label: "Half‑Day", value: stats.half, color: "warning" as const }, { label: "Absent", value: stats.absent, color: "error" as const }].map(
            (s) => (
              <Box key={s.label}>
                <Stack direction="row" justifyContent="space-between" sx={{ alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{s.value}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={s.value} color={s.color} sx={{ mt: 0.5, height: 8, borderRadius: 0, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { borderRadius: 0 } }} />
              </Box>
            )
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

// ===================== PAGE ===================== //
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"light" | "dark">("light");
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  type Range = "today" | "week" | "month";
  const [range, setRange] = React.useState<Range>("today");
  const datasets: Record<Range, { present: number; half: number; absent: number; bars: number[]; unit: string }> = {
    today: { present: 92, half: 6, absent: 2, bars: [72, 84, 90, 88, 94, 91, 92], unit: "days" },
    week: { present: 89, half: 8, absent: 3, bars: [86, 88, 90, 87, 91, 89, 90], unit: "days" },
    month: { present: 90, half: 7, absent: 3, bars: [80, 82, 85, 88, 86, 89, 90], unit: "weeks" },
  };
  const stats = datasets[range];

  // --------------------- Dev Tests --------------------- //
  React.useEffect(() => {
    // Test 1: percentages sum to 100
    (Object.keys(datasets) as Range[]).forEach((k) => {
      const { present, half, absent } = datasets[k];
      console.assert(present + half + absent === 100, `[TEST] ${k} percentages should sum to 100`);
    });

    // Test 2: bars length and bounds
    (Object.keys(datasets) as Range[]).forEach((k) => {
      const arr = datasets[k].bars;
      console.assert(arr.length === 7, `[TEST] ${k} bars should have 7 entries`);
      console.assert(arr.every((v) => v >= 0 && v <= 100), `[TEST] ${k} bars values within 0..100`);
    });

    // Test 3: Sparkline normalisation sanity
    const norm = (vals: number[]) => {
      const min = Math.min(...vals, 60);
      const max = Math.max(...vals, 100);
      return vals.map((v) => (v - min) / Math.max(1, max - min));
    };
    console.assert(JSON.stringify(norm([0, 50, 100])) === JSON.stringify([0, 0, 0.5]), "[TEST] norm floor at 60 affects low values");
    console.assert(JSON.stringify(norm([60, 80, 100])) === JSON.stringify([0, 0.5, 1]), "[TEST] norm with floor works");
  }, []);
  // ----------------------------------------------------- //

  const scrollTo = (hash: string) => () => {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: { backgroundColor: theme.palette.background.default },
          body: { backgroundColor: theme.palette.background.default, color: theme.palette.text.primary },
        }}
      />

      {/* AppBar */}
      <HideOnScroll>
        <AppBar elevation={0} color="transparent" position="sticky">
          <Toolbar
            sx={{
              backdropFilter: "saturate(180%) blur(10px)",
              bgcolor: theme.palette.mode === "light" ? "rgba(255,255,255,0.72)" : "rgba(11,16,32,0.85)",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
              <WifiRoundedIcon color="secondary" />
              <Typography variant="h6" fontWeight={800} color="primary">PulseHR</Typography>
              <Chip size="small" label="Wi‑Fi Attendance" color="secondary" variant="outlined" sx={{ ml: 1 }} />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ display: { xs: mobileOpen ? "flex" : "none", md: "flex" } }}>
              <Button onClick={scrollTo("#features")} color="primary">Features</Button>
              <Button onClick={scrollTo("#tech")} color="primary">Tech Stack</Button>
              <Button onClick={scrollTo("#how")} color="primary">How it works</Button>
              <Button onClick={scrollTo("#cta")} color="primary">Get Started</Button>
            </Stack>

            <IconButton onClick={() => setMode(mode === "light" ? "dark" : "light")} sx={{ ml: 1 }}>
              {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            <IconButton sx={{ display: { xs: "inline-flex", md: "none" }, ml: 1 }} onClick={() => setMobileOpen(!mobileOpen)}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            theme.palette.mode === "light"
              ? "radial-gradient(1200px 600px at -10% -10%, #c7d2fe22 0%, transparent 60%), radial-gradient(900px 500px at 110% 10%, #e9d5ff22 0%, transparent 60%), linear-gradient(135deg, #fafaff 0%, #ffffff 60%)"
              : "radial-gradient(1200px 600px at -10% -10%, #312e8122 0%, transparent 60%), radial-gradient(900px 500px at 110% 10%, #4c1d9522 0%, transparent 60%), linear-gradient(135deg, #0b1020 0%, #0f172a 60%)",
        }}
      >
        <Container sx={{ py: { xs: 10, md: 16 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid xs={12} md={6}>
              <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Stack spacing={2} sx={{ maxWidth: 620 }}>
                  <Chip label="PulseHR 2.0" color="secondary" variant="outlined" sx={{ alignSelf: "flex-start", fontWeight: 700 }} />
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      lineHeight: 1.1,
                      fontWeight: 800,
                      backgroundImage:
                        theme.palette.mode === "light"
                          ? "linear-gradient(90deg,#111827 10%,#4f46e5 60%,#a855f7 100%)"
                          : "linear-gradient(90deg,#e5e7eb 10%,#93c5fd 60%,#d8b4fe 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                    gutterBottom
                  >
                    Attendance that just works
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Wi‑Fi–verified attendance with smart half‑day logic, effortless regularization, and a live dashboard. A clean, fast HR foundation.
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} onClick={scrollTo("#cta")}>Start free pilot</Button>
                    <Button variant="outlined" size="large" onClick={scrollTo("#features")}>Explore features</Button>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                    <Chip icon={<WifiRoundedIcon />} label="Wi‑Fi verified" variant="outlined" sx={{ borderColor: "divider" }} />
                    <Chip icon={<TimelineRoundedIcon />} label="Half‑day logic" variant="outlined" sx={{ borderColor: "divider" }} />
                    <Chip icon={<SpeedRoundedIcon />} label="Realtime alerts" variant="outlined" sx={{ borderColor: "divider" }} />
                  </Stack>
                </Stack>
              </MotionBox>
            </Grid>

            <Grid xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                sx={{
                  borderRadius: 12,
                  p: 2,
                  background:
                    theme.palette.mode === "light"
                      ? "linear-gradient(180deg, rgba(79,70,229,0.10), rgba(168,85,247,0.10))"
                      : "linear-gradient(180deg, rgba(129,140,248,0.20), rgba(216,180,254,0.12))",
                }}
              >
                <Box sx={{ borderRadius: 12, bgcolor: theme.palette.background.paper, boxShadow: 6, p: 3, minWidth: 0 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1} sx={{ flexWrap: "wrap", gap: 1.5, minWidth: 0 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="overline" sx={{ opacity: 0.8 }}>{range === "today" ? "Today" : range === "week" ? "This Week" : "This Month"}</Typography>
                      <Typography variant="h5" fontWeight={700}>Attendance Overview</Typography>
                    </Box>
                    <ToggleButtonGroup value={range} exclusive onChange={(e, v) => v && setRange(v)} size="small" color="secondary">
                      <ToggleButton value="today">Today</ToggleButton>
                      <ToggleButton value="week">Week</ToggleButton>
                      <ToggleButton value="month">Month</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>

                  {/* HERO CONTENT */}
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid xs={12} md={7}>
                      <AttendanceCard theme={theme} range={range} stats={stats} />
                    </Grid>

                    <Grid xs={12} md={5}>
                      <Card variant="outlined" sx={{ ...cardBase, p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Quick status</Typography>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                          <Chip color="success" icon={<CheckCircleRoundedIcon />} label="Wi‑Fi OK" variant="filled" sx={{ borderRadius: 999 }} />
                          <Chip color="warning" label="2 disconnects" variant="filled" sx={{ borderRadius: 999 }} />
                          <Chip color="info" label="3 approvals" variant="filled" sx={{ borderRadius: 999 }} />
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="text.secondary">Health</Typography>
                        <Stack spacing={1.2} sx={{ mt: 1 }}>
                          <Box>
                            <Stack direction="row" justifyContent="space-between" sx={{ alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">Uptime</Typography>
                              <Typography variant="body2" fontWeight={700}>99.96%</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={99.96} color="success" sx={{ mt: 0.5, height: 8, borderRadius: 999 }} />
                          </Box>
                          <Box>
                            <Stack direction="row" justifyContent="space-between" sx={{ alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">Latency</Typography>
                              <Typography variant="body2" fontWeight={700}>120ms</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={86} color="secondary" sx={{ mt: 0.5, height: 8, borderRadius: 999 }} />
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container>
        <Section id="features">
          <MotionBox initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Typography variant="overline" color="secondary">Core features</Typography>
            <Typography variant="h3" sx={{ mb: 2 }}>Built for HR accuracy & speed</Typography>
            <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 720 }}>
              Attendance via Wi‑Fi / GPS / manual punch, intelligent half‑day auto‑marking, leave & regularization workflows, and a live dashboard.
            </Typography>
            <Grid container spacing={3} alignItems="stretch">
              {[
                { icon: <WifiRoundedIcon color="secondary" fontSize="large" />, title: "Wi‑Fi‑Locked Login", desc: "Authenticate only on office networks for true presence verification." },
                { icon: <TimelineRoundedIcon color="secondary" fontSize="large" />, title: "Smart Half‑Day Logic", desc: "Auto‑flag half‑days after >2 disconnects/day with audit trail." },
                { icon: <SecurityRoundedIcon color="secondary" fontSize="large" />, title: "Role‑Based Access", desc: "Separate Employee vs HR/Admin permissions with controls." },
                { icon: <SpeedRoundedIcon color="secondary" fontSize="large" />, title: "Realtime Alerts", desc: "Missed punches, disconnects, and approvals via notifications." },
              ].map((f) => (
                <Grid key={f.title} xs={12} sm={6} md={3}>
                  <FeatureCard icon={f.icon} title={f.title} desc={f.desc} />
                </Grid>
              ))}
            </Grid>
          </MotionBox>
        </Section>
      </Container>

      {/* How it works */}
      <Box sx={{ background: theme.palette.mode === "light" ? "linear-gradient(180deg, #ffffff, #f6f7fb)" : "linear-gradient(180deg, #0b1020, #0f172a)" }}>
        <Container>
          <Section id="how">
            <MotionBox initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Typography variant="overline" color="secondary">Workflow</Typography>
              <Typography variant="h3" sx={{ mb: 2 }}>How it works</Typography>
              <Grid container spacing={3} alignItems="stretch">
                {[
                  { step: "01", title: "Connect & Verify", text: "User connects to office Wi‑Fi; network signature verifies presence." },
                  { step: "02", title: "Punch & Track", text: "Employee punches via Wi‑Fi/GPS/manual; realtime status updates dashboard." },
                  { step: "03", title: "Auto‑Policies", text: ">2 disconnects triggers half‑day; exceptions handled via regularization." },
                  { step: "04", title: "Approve & Report", text: "HR reviews requests, exports reports, and monitors KPIs." },
                ].map((s) => (
                  <Grid key={s.step} xs={12} md={3}>
                    <Card variant="outlined" sx={{ ...cardBase }}>
                      <CardContent>
                        <Typography variant="overline" color="secondary">{s.step}</Typography>
                        <Typography variant="h6" sx={{ mb: 1 }}>{s.title}</Typography>
                        <Typography color="text.secondary">{s.text}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </MotionBox>
          </Section>
        </Container>
      </Box>

      {/* Tech Stack */}
      <Container>
        <Section id="tech">
          <MotionBox initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Typography variant="overline" color="secondary">Stack</Typography>
            <Typography variant="h3" sx={{ mb: 3 }}>Built with modern web tech</Typography>
            <Grid container spacing={2}>
              {["React", "TypeScript", "Material‑UI", "PWA", "Node.js", "Express", "JWT", "WebSockets", "PostgreSQL", "Redis"].map((t) => (
                <Grid key={t}>
                  <Chip label={t} variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                </Grid>
              ))}
            </Grid>
          </MotionBox>
        </Section>
      </Container>

      {/* CTA */}
      <Box sx={{ background: theme.palette.mode === "light" ? "linear-gradient(135deg, #eef2ff, #ffffff)" : "linear-gradient(135deg, #111827, #0b1020)" }}>
        <Container>
          <Section id="cta">
            <MotionBox initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Grid container spacing={4} alignItems="stretch">
                {/* Left: big pitch + primary actions */}
                <Grid xs={12} md={7}>
                  <Card variant="outlined" sx={{ ...cardBase, p: { xs: 2, md: 3 } }}>
                    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography variant="overline" color="secondary">Get started</Typography>
                      <Typography variant="h4">Ready to streamline HR?</Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Ship a pilot in days. Add your domain, Wi‑Fi signatures, and policies — and go live.
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
                        <Button size="large" variant="contained" endIcon={<ArrowForwardRoundedIcon />} component={Link} href="/dashboard">Start free pilot</Button>
                        <Button size="large" variant="outlined" component={Link} href="/dashboard">Go to Dashboard</Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Right: sandbox benefits + access */}
                <Grid xs={12} md={5}>
                  <Card variant="outlined" sx={{ ...cardBase }}>
                    <CardContent>
                      <Typography variant="overline" color="secondary">Get a sandbox</Typography>
                      <Typography variant="h5" sx={{ mb: 1 }}>Request access</Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>Everything you need to evaluate:</Typography>
                      <Stack spacing={1.2} sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleRoundedIcon color="success" fontSize="small" />
                          <Typography>Demo tenant</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleRoundedIcon color="success" fontSize="small" />
                          <Typography>Sample data</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleRoundedIcon color="success" fontSize="small" />
                          <Typography>Guided setup</Typography>
                        </Stack>
                      </Stack>
                      <CardActions sx={{ pt: 0 }}>
                        <Button fullWidth variant="contained">Request access</Button>
                      </CardActions>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </MotionBox>
          </Section>
        </Container>
      </Box>

      {/* Footer */}
      <Container>
        <Box component="footer" sx={{ py: 6 }}>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid>
              <Stack direction="row" spacing={1} alignItems="center">
                <WifiRoundedIcon color="secondary" />
                <Typography fontWeight={800} color="primary">PulseHR</Typography>
                <Typography color="text.secondary">© {new Date().getFullYear()}</Typography>
              </Stack>
            </Grid>
            <Grid>
              <Stack direction="row" spacing={1}>
                <IconButton><GitHubIcon /></IconButton>
                <IconButton><TwitterIcon /></IconButton>
                <IconButton><LinkedInIcon /></IconButton>
                <MUILink href="#" underline="hover" sx={{ alignSelf: "center", ml: 2 }}>Privacy</MUILink>
                <MUILink href="#" underline="hover" sx={{ alignSelf: "center" }}>Terms</MUILink>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
