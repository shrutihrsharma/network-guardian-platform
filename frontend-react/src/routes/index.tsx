import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Eye,
  Layers,
  LineChart,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compliance Sentinel AI — Predict. Prevent. Prioritize." },
      {
        name: "description",
        content:
          "Enterprise AI platform that predicts compliance risks before they become audit failures. Turn reactive compliance into a predictive, prioritized program.",
      },
      { property: "og:title", content: "Compliance Sentinel AI — Predict. Prevent. Prioritize." },
      {
        property: "og:description",
        content: "Enterprise AI platform that predicts compliance risks before they become audit failures. Turn reactive compliance into a predictive, prioritized program.",
      },
    ],
  }),
  component: Landing,
});

const problems = [
  {
    icon: AlertTriangle,
    title: "Audits fail on findings nobody saw coming",
    body: "Veracode, ACM, DR and certificate data live in silos. By the time issues surface, remediation windows have already closed.",
  },
  {
    icon: Layers,
    title: "1000+ apps, one spreadsheet",
    body: "Compliance teams manually stitch signals across business units — no shared view of true risk, no way to prioritize.",
  },
  {
    icon: Eye,
    title: "Blind to the next 90 days",
    body: "Traditional GRC reports what already broke. Executives cannot answer 'which audit will fail next quarter and why?'",
  },
];

const solutions = [
  {
    icon: Brain,
    title: "AI Risk Forecasting",
    body: "A dedicated forecaster model correlates telemetry across 24+ sources and predicts audit-failure probability per application, 30/60/90 days out.",
  },
  {
    icon: Sparkles,
    title: "Explainable Recommendations",
    body: "Every prediction ships with a 'Why?' — the drivers, historical evidence, and the exact remediation that reduces risk the most.",
  },
  {
    icon: Target,
    title: "What-if Simulation",
    body: "Toggle remediation scenarios and watch the risk trajectory, cost, and business impact recompute in real time before you commit.",
  },
  {
    icon: ClipboardCheck,
    title: "Human-in-the-loop Decisions",
    body: "AI proposes, humans approve. Auto-approve trusted actions, escalate the rest — with a full audit trail for regulators.",
  },
];

const benefits = [
  { value: "62%", label: "Fewer surprise audit findings", icon: ShieldCheck },
  { value: "3.4x", label: "Faster remediation cycle", icon: Zap },
  { value: "$4.8M", label: "Avoided fines & rework per year", icon: TrendingUp },
  { value: "90d", label: "Forward-looking risk horizon", icon: Gauge },
];

const valuePillars = [
  {
    title: "For the CISO",
    points: [
      "One board-ready view of enterprise compliance posture",
      "Predictive risk score across every regulated application",
      "Evidence pack generated for every audit, on demand",
    ],
  },
  {
    title: "For Compliance & Risk",
    points: [
      "Prioritized worklist ranked by predicted failure probability",
      "Cross-domain correlation across Veracode, ACM, DR, Certs",
      "Simulation before commitment — no more guessing ROI",
    ],
  },
  {
    title: "For Engineering Leaders",
    points: [
      "Application-level scorecards with concrete next actions",
      "Auto-generated Jira items for high-confidence AI decisions",
      "Less audit toil, more time on the roadmap",
    ],
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-[420px] -right-40 h-[420px] w-[520px] rounded-full bg-primary/5 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.9 0.02 260) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.02 260) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-4">
          <img
            src="/assets/logo.svg"
            alt="Sentinel AI logo"
            className="h-[7.5rem] w-[7.5rem] rounded-xl object-contain"
          />
          <div className="min-w-0">
            <div className="text-[13px] font-semibold tracking-wide text-foreground">
              Sentinel AI
            </div>
            <div className="text-gold-gradient text-[10.5px] font-medium uppercase tracking-[0.18em]">
              Predict · Prevent · Prioritize
            </div>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#problem" className="hover:text-foreground">
            Problem
          </a>
          <a href="#solution" className="hover:text-foreground">
            Solution
          </a>
          <a href="#value" className="hover:text-foreground">
            Business value
          </a>
          <a href="#benefits" className="hover:text-foreground">
            Benefits
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-10 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Enterprise AI · Predictive Compliance
          </div>
          <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Predict compliance risk <br className="hidden md:block" />
            <span className="text-gold-gradient">
              before the audit finds it.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Compliance Sentinel AI is the unified enterprise AI platform for
            Deutsche Bank — one experience for executive oversight and
            operational intelligence across the estate.
          </p>
        </motion.div>

        {/* Two entry points */}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass group relative overflow-hidden rounded-2xl border border-border/40 p-8"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl gold-gradient text-primary-foreground shadow-lg shadow-primary/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
              Executive Intelligence
            </h3>
            <div className="mt-1 text-sm text-gold-gradient font-medium">
              Enterprise AI for CISO, BISO and Compliance Leadership
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Predict audit failures, prioritize enterprise remediation,
              understand regulatory exposure and monitor compliance posture
              across the entire technology estate.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-foreground/80">
              {[
                "Enterprise Compliance Score & AI Risk Score",
                "Cross-application risk heatmap",
                "Regulatory exposure & business impact",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{" "}
                  {p}
                </li>
              ))}
            </ul>
            <Link
              to="/executive"
              className="mt-7 inline-flex items-center gap-2 rounded-lg gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95"
            >
              Executive Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass group relative overflow-hidden rounded-2xl border border-border/40 p-8"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/30">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
              Operational Intelligence
            </h3>
            <div className="mt-1 text-sm text-gold-gradient font-medium">
              AI Workspace for Application Owners
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Monitor infrastructure health, incidents, compliance, lifecycle,
              certificates, predictive failures and operational AI
              recommendations — per application.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-foreground/80">
              {[
                "Devices, firmware & certificate posture",
                "AI root-cause & failure forecasting",
                "Decision history and audit trail",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{" "}
                  {p}
                </li>
              ))}
            </ul>
            {/* <Link
              to="/operations"
              className="mt-7 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15"
            >
              Operational Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link> */}
            <a
              href="https://intelligent-perception-production-f1bc.up.railway.app/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15"
            >
              Operational Dashboard
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
          <span>SOX</span>
          <span>·</span>
          <span>PCI-DSS</span>
          <span>·</span>
          <span>GDPR</span>
          <span>·</span>
          <span>MAS TRM</span>
          <span>·</span>
          <span>DORA</span>
          <span>·</span>
          <span>NIST CSF</span>
        </div>

        {/* Hero glass panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="glass mt-16 rounded-2xl border border-border/40 p-6 md:p-8"
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.label} className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-2xl font-semibold text-foreground">
                    {b.value}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {b.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Problem */}
      <section
        id="problem"
        className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10"
      >
        <div className="max-w-2xl">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            The problem
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Compliance is still reactive — audits punish what teams could not
            see.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Regulated enterprises operate thousands of applications generating
            millions of compliance signals. Teams drown in evidence collection
            while material risk hides in the gaps between tools.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass rounded-xl border border-border/40 p-6"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section
        id="solution"
        className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10"
      >
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              The solution
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              An AI copilot that forecasts, explains, and orchestrates.
            </h2>
            <p className="mt-4 text-muted-foreground">
              One platform unifies telemetry across your entire estate, learns
              from historical audit outcomes, and turns compliance from a
              rear-view mirror into a forward-looking program.
            </p>
          </div>
          <Link
            to="/simulator"
            className="text-sm font-medium text-primary hover:opacity-90"
          >
            Try the What-if Simulator →
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass group relative overflow-hidden rounded-xl border border-border/40 p-6"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg gold-gradient text-primary-foreground shadow-lg shadow-primary/20">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Business Value */}
      <section
        id="value"
        className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10"
      >
        <div className="max-w-2xl">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            Business value
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Purpose-built for the people accountable to the regulator.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {valuePillars.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass rounded-xl border border-border/40 p-6"
            >
              <h3 className="text-gold-gradient text-sm font-semibold uppercase tracking-[0.14em]">
                {v.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {v.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-sm text-foreground/90"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Expected Benefits */}
      <section
        id="benefits"
        className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10"
      >
        <div className="glass overflow-hidden rounded-2xl border border-border/40 p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                Expected benefits
              </div>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Move from evidence collection to{" "}
                <span className="text-gold-gradient">risk elimination.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Deployed across a Tier-1 bank estate, Compliance Sentinel AI
                compresses the compliance lifecycle end to end — from finding,
                to decision, to closure.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg gold-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 hover:opacity-95"
                >
                  Enter Executive Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/copilot"
                  className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-white/[0.02] px-6 py-3 text-sm font-medium text-foreground hover:bg-white/[0.04]"
                >
                  Ask the AI Copilot
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: LineChart, k: "-58%", v: "Audit prep hours" },
                { icon: ShieldCheck, k: "+41%", v: "First-time-pass audits" },
                { icon: Zap, k: "72h", v: "Median time-to-remediate" },
                { icon: Brain, k: "97%", v: "AI decision confidence" },
              ].map((m) => (
                <div
                  key={m.v}
                  className="rounded-xl border border-border/40 bg-white/[0.02] p-5"
                >
                  <m.icon className="h-5 w-5 text-primary" />
                  <div className="mt-3 font-display text-2xl font-semibold text-foreground">
                    {m.k}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {m.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-8 text-xs text-muted-foreground md:flex-row md:items-center lg:px-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Compliance Sentinel AI · Predict. Prevent. Prioritize.
          </div>
          <div>
            © {new Date().getFullYear()} Enterprise AI Platform · Internal use
          </div>
        </div>
      </footer>
    </div>
  );
}
